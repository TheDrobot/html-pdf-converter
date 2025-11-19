// Production-ready Puppeteer configuration
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BrowserOptions {
  isProduction?: boolean;
  chromePath?: string;
}

export async function getChromeExecutablePath(): Promise<string> {
  // In production environment (like Hostinger), try to find system Chrome
  const possiblePaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    process.env.CHROME_PATH
  ].filter(Boolean);

  // Check if any of these paths exist
  for (const path of possiblePaths) {
    try {
      if (path) {
        await execAsync(`which ${path}`);
        return path;
      }
    } catch (error) {
      // Path doesn't exist, continue
    }
  }

  // Fallback to puppeteer's bundled Chromium
  return puppeteer.executablePath();
}

export async function createBrowser(options: BrowserOptions = {}) {
  const { isProduction = process.env.NODE_ENV === 'production' } = options;

  const browserArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-web-security',
    '--no-first-run',
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-translate',
    '--disable-device-discovery-notifications',
    '--disable-software-rasterizer',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--memory-pressure-off',
    '--max_old_space_size=4096'
  ];

  const launchOptions: any = {
    headless: 'new',
    args: browserArgs,
    ignoreHTTPSErrors: true,
    timeout: 60000,
    protocolTimeout: 60000
  };

  // In production, use system Chrome if available
  if (isProduction) {
    try {
      const chromePath = await getChromeExecutablePath();
      if (chromePath && chromePath !== puppeteer.executablePath()) {
        launchOptions.executablePath = chromePath;
        console.log(`🚀 Using system Chrome: ${chromePath}`);
      } else {
        console.log('📦 Using Puppeteer bundled Chromium');
      }
    } catch (error) {
      console.warn('⚠️ Could not find system Chrome, using bundled version');
    }
  }

  return puppeteer.launch(launchOptions);
}