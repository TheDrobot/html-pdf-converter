import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import puppeteer from 'puppeteer';
import { existsSync } from 'fs';

const isProd = process.env.NODE_ENV === 'production';

// Funzione per trovare l'ultima riga con VERO contenuto in un'immagine
async function findLastContentRow(imageBuffer: Buffer): Promise<number> {
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { width, height, channels } = info;
  console.log(`🔍 Analyzing image: ${width}x${height}, channels: ${channels}`);
  
  // Scan dal basso verso l'alto cercando VERO contenuto (non solo pixel grigi/colorati)
  let lastContentY = 0;
  let consecutiveEmptyRows = 0;
  const THRESHOLD_EMPTY_ROWS = 50; // Se troviamo 50 righe vuote, ci fermiamo
  
  for (let y = height - 1; y >= 0; y--) {
    let contentPixels = 0;
    let totalSampled = 0;
    
    // Campiona tutti i pixel della riga (ogni 5 pixel)
    for (let x = 0; x < width; x += 5) {
      const pixelIndex = (y * width + x) * channels;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      totalSampled++;
      
      // Contenuto = pixel significativamente diversi dal bianco
      // Soglia più stretta: < 240 invece di < 250
      if (r < 240 || g < 240 || b < 240) {
        contentPixels++;
      }
    }
    
    // Calcola percentuale di pixel con contenuto
    const contentPercent = (contentPixels / totalSampled) * 100;
    
    // Considera "contenuto" solo se almeno 5% dei pixel sono non-bianchi
    if (contentPercent >= 5) {
      lastContentY = y;
      consecutiveEmptyRows = 0;
      if (y % 500 === 0) {
        console.log(`📍 Content at row ${y}, ${contentPercent.toFixed(1)}% filled`);
      }
    } else {
      consecutiveEmptyRows++;
      
      // Se troviamo 50 righe consecutive vuote DOPO aver trovato contenuto, ci fermiamo
      if (lastContentY > 0 && consecutiveEmptyRows >= THRESHOLD_EMPTY_ROWS) {
        console.log(`✅ Found ${THRESHOLD_EMPTY_ROWS} empty rows after content, stopping at ${lastContentY}`);
        break;
      }
    }
  }
  
  if (lastContentY > 0) {
    console.log(`✅ Last content found at row ${lastContentY} of ${height}`);
    console.log(`📊 Whitespace removed: ${((height - lastContentY) / height * 100).toFixed(1)}%`);
    return lastContentY + 20; // +20px margine di sicurezza
  }
  
  console.log(`⚠️ No content found, using 50% of height as fallback`);
  return Math.floor(height * 0.5);
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { htmlContent, pageFormat = "a4" } = await request.json();

    if (!htmlContent?.trim()) {
      return NextResponse.json(
        { error: "Contenuto HTML mancante" },
        { status: 400 }
      );
    }

    // Lancia Puppeteer con configurazione per container
    const environment = isProd ? 'PRODUCTION' : 'DEVELOPMENT';
    console.log(`🚀 Launching browser in ${environment} mode...`);
    
    // Common arguments for all environments
    const browserArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-web-security',
      '--no-first-run',
      '--disable-extensions'
    ];
    
    const launchOptions: any = {
      headless: 'new',
      args: browserArgs,
      ignoreHTTPSErrors: true
    };
    
    // In production, try to find system Chromium
    if (isProd) {
      console.log('📦 Looking for system Chromium in production...');
      
      const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        process.env.CHROME_PATH // Allow custom path via env variable
      ].filter(Boolean);
      
      let foundPath = null;
      for (const chromePath of possiblePaths) {
        if (chromePath && existsSync(chromePath)) {
          foundPath = chromePath;
          console.log(`✅ Found system Chromium at: ${chromePath}`);
          break;
        }
      }
      
      if (foundPath) {
        launchOptions.executablePath = foundPath;
      } else {
        console.log('⚠️ No system Chromium found, using Puppeteer bundled version');
        console.log('💡 Tip: Install chromium in your container: apt-get install chromium-browser');
      }
    } else {
      console.log('📦 Using Puppeteer bundled Chromium in development...');
    }
    
    console.log('🔧 Launch options:', JSON.stringify(launchOptions, null, 2));
    
    try {
      browser = await puppeteer.launch(launchOptions);
      console.log('✅ Browser launched successfully');
    } catch (launchError) {
      console.error('❌ Failed to launch browser:', launchError);
      
      // Fallback: try without custom executable path
      if (launchOptions.executablePath) {
        console.log('🔄 Retrying without custom executable path...');
        delete launchOptions.executablePath;
        try {
          browser = await puppeteer.launch(launchOptions);
          console.log('✅ Browser launched successfully (fallback)');
        } catch (fallbackError) {
          throw new Error(
            'Failed to launch browser. Please ensure Chromium is installed in your container. ' +
            'Original error: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError))
          );
        }
      } else {
        throw new Error(
          'Failed to launch browser. ' +
          'Original error: ' + (launchError instanceof Error ? launchError.message : String(launchError))
        );
      }
    }

    const page = await browser.newPage();

    // Imposta un viewport ampio per assicurare che il contenuto non sia ristretto
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2 // Per una migliore qualità del rendering
    });

    // Inietta Tailwind CSS CDN e CSS per rimuovere margini nell'HTML se non già presente
    let enhancedHtml = htmlContent;
    
    // CSS per rimuovere tutti i margini e padding di default
    const resetCss = `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; }
    </style>`;
    
    // Verifica se Tailwind CSS è già incluso
    const hasTailwind = /cdn\.tailwindcss\.com/i.test(htmlContent);
    
    if (!hasTailwind) {
      console.log('📦 Adding Tailwind CSS CDN...');
      // Aggiungi il reset CSS e Tailwind
      const tailwindCdn = '<script src="https://cdn.tailwindcss.com"></script>';
      enhancedHtml = htmlContent.replace(
        /<\/head>/i,
        `${resetCss}${tailwindCdn}</head>`
      );
    } else {
      console.log('✅ Tailwind CSS already included');
      // Aggiungi solo il reset CSS
      enhancedHtml = htmlContent.replace(
        /<\/head>/i,
        `${resetCss}</head>`
      );
    }

    // Se non c'è un tag <head>, aggiungilo
    if (!/<head>/i.test(enhancedHtml)) {
      console.log('📝 Adding <head> tag...');
      enhancedHtml = enhancedHtml.replace(
        /(<html[^>]*>)/i,
        `$1<head>${resetCss}${!hasTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}</head>`
      );
    }

    console.log('📝 Setting page content...');
    await page.setContent(enhancedHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    console.log('⏳ Waiting for all images and scripts to load...');
    await page.evaluate(() => {
      return Promise.all([
        ...Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((resolve) => (img.onload = img.onerror = resolve))
        ),
        new Promise((resolve) => setTimeout(resolve, 500))
      ]);
    });

    console.log('📄 Generating PDF...');

    if (pageFormat === "single") {
      // ===== SINGLE PAGE (CONTINUOUS) =====
      console.log('📏 Measuring content height for single continuous page...');

      // 1. Ottieni l'altezza reale del body
      const bodyHeight = await page.evaluate(() => {
        const body = document.body;
        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
      });

      console.log(`📏 Content height measured: ${bodyHeight}px`);

      // 2. Genera prima come PNG ad alta risoluzione
      const fullPageScreenshot = await page.screenshot({
        fullPage: true,
        type: 'png',
        captureBeyondViewport: true
      });

      console.log('🖼️ Full page screenshot captured, analyzing...');

      // 3. Trova l'ultima riga con contenuto
      const lastContentRow = await findLastContentRow(Buffer.from(fullPageScreenshot));

      console.log(`✂️ Trimming screenshot to height: ${lastContentRow}px`);

      // 4. Ritaglia l'immagine alla riga corretta
      const trimmedImage = await sharp(fullPageScreenshot)
        .extract({ left: 0, top: 0, width: 1920 * 2, height: lastContentRow })
        .png()
        .toBuffer();

      console.log('✅ Screenshot trimmed successfully');

      // 5. Crea un PDF con le dimensioni esatte del contenuto
      const pdfWidth = 595; // A4 width in points
      const pdfHeight = (lastContentRow / (1920 * 2)) * pdfWidth * (1920 / 595);

      console.log(`📄 Creating PDF: ${pdfWidth}x${pdfHeight} points`);

      // 6. Genera PDF vuoto e inserisci l'immagine
      const pdfDoc = await PDFDocument.create();
      const page1 = pdfDoc.addPage([pdfWidth, pdfHeight]);

      const pngImage = await pdfDoc.embedPng(trimmedImage);
      const pngDims = pngImage.scale(1);

      page1.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight
      });

      const pdfBytes = await pdfDoc.save();

      console.log(`✅ PDF generato: ${pdfBytes.length} bytes, ${pdfHeight.toFixed(0)} points height`);

      await browser.close();

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="document-${Date.now()}.pdf"`,
        },
      });
    } else {
      // ===== A4 FORMAT (PAGED) =====
      console.log('📄 Generating A4 format PDF...');

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
        preferCSSPageSize: false,
      });

      console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);

      await browser.close();

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="document-${Date.now()}.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error("❌ Errore durante la conversione PDF:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      environment: isProd ? 'production' : 'development'
    });

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("❌ Error closing browser:", closeError);
      }
    }

    return NextResponse.json(
      {
        error: "Errore durante la conversione PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
