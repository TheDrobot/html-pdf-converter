# 📄 HTML to PDF Converter

Un'applicazione web moderna per convertire file HTML in PDF con anteprima in tempo reale e formati di esportazione multipli.

![Next.js](https://img.shields.io/badge/Next.js-14.2.28-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38bdf8)

## ✨ Caratteristiche Principali

- 🖥️ **Editor HTML Live** con syntax highlighting (Ace Editor)
- 👁️ **Anteprima in Tempo Reale** del contenuto HTML
- 📄 **Generazione PDF** in formato A4 o pagina singola continua
- 📤 **Upload File HTML** diretto
- 🎨 **UI Moderna e Responsive** con tema dark/light
- ⚡ **Conversione Veloce** usando Puppeteer
- ☁️ **Integrazione Cloud Storage** (AWS S3 opzionale)
- 🚀 **Deploy Ready** per Vercel, Hostinger VPS, e altri provider

## 🛠️ Stack Tecnologico

### Frontend
- **Framework**: Next.js 14.2.28 (App Router)
- **UI Library**: React 18.2.0
- **Linguaggio**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **Componenti UI**: Radix UI
- **Editor**: Ace Editor (react-ace)
- **Icone**: Lucide React

### Backend & Processing
- **PDF Generation**: Puppeteer + pdf-lib + Sharp
- **Chromium**: @sparticuz/chromium (per Vercel/Lambda)
- **Image Processing**: Sharp
- **Cloud Storage**: AWS S3 SDK (opzionale)
- **Database**: PostgreSQL con Prisma (opzionale)

## 📦 Installazione

### Prerequisiti
- Node.js 18+
- npm o yarn
- (Opzionale) PostgreSQL
- (Opzionale) AWS S3 bucket

### Setup Locale

```bash
# 1. Clona il repository
git clone https://github.com/TheDrobot/html-pdf-converter.git
cd html-pdf-converter/html_to_pdf_converter/nextjs_space

# 2. Installa le dipendenze (skip download Puppeteer per Vercel)
PUPPETEER_SKIP_DOWNLOAD=true npm install

# 3. Crea il file .env.local
cp .env.example .env.local

# 4. Configura le variabili d'ambiente
nano .env.local

# 5. Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## ⚙️ Configurazione

### Variabili d'Ambiente

Crea un file `.env.local` nella cartella `html_to_pdf_converter/nextjs_space/`:

```env
# Ambiente
NODE_ENV=production

# AWS S3 (Opzionale - per upload file)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_FOLDER_PREFIX=html-converter/

# Database (Opzionale)
DATABASE_URL="postgresql://user:password@localhost:5432/html_converter"

# Chrome/Chromium (per deployment non-Vercel)
CHROME_PATH=/usr/bin/chromium-browser

# Skip Puppeteer download (per Vercel)
PUPPETEER_SKIP_DOWNLOAD=true
```

## 🚀 Deployment

### Deploy su Vercel (Raccomandato)

1. **Connetti il repository a Vercel**
   - Vai su [vercel.com](https://vercel.com)
   - Import il progetto da GitHub

2. **Configura la Root Directory**
   - Settings → General → Root Directory
   - Imposta: `html_to_pdf_converter/nextjs_space`
   - Salva

3. **Aggiungi le variabili d'ambiente**
   - Settings → Environment Variables
   - Aggiungi:
     - `NODE_ENV` = `production`
     - `PUPPETEER_SKIP_DOWNLOAD` = `true`
     - (Opzionale) Credenziali AWS

4. **Deploy**
   - Vercel farà il deploy automaticamente ad ogni push su main

### Deploy su VPS (Hostinger, DigitalOcean, etc.)

```bash
# 1. SSH nel server
ssh user@your-server.com

# 2. Installa dipendenze di sistema
sudo apt update
sudo apt install -y chromium-browser nodejs npm

# 3. Clona e configura
git clone https://github.com/TheDrobot/html-pdf-converter.git
cd html-pdf-converter/html_to_pdf_converter/nextjs_space
npm install

# 4. Build
npm run build

# 5. Avvia con PM2
npm install -g pm2
pm2 start npm --name "html-pdf-converter" -- start
pm2 save
pm2 startup
```

Vedi [DEPLOYMENT.md](./html_to_pdf_converter/nextjs_space/DEPLOYMENT.md) per istruzioni dettagliate.

## 📖 Come Funziona

### Flusso di Conversione

1. **Input HTML**: L'utente può:
   - Scrivere HTML nell'editor integrato
   - Uploadare un file .html/.htm

2. **Anteprima Live**: Il contenuto viene renderizzato in tempo reale in un iframe

3. **Conversione PDF**: Quando l'utente clicca "Convert to PDF":
   - Il contenuto HTML viene inviato all'API `/api/convert-pdf`
   - Puppeteer apre un browser headless
   - Il browser renderizza l'HTML con tutti gli stili
   - In base al formato scelto:
     - **A4**: genera PDF multi-pagina standard
     - **Continuo**: cattura screenshot, analizza il contenuto e genera PDF single-page ottimizzato
   - Il PDF viene scaricato automaticamente

### Formato "Single Continuous Page"

Questo formato unico:
- Cattura l'intera pagina come screenshot ad alta risoluzione
- Analizza pixel per pixel per trovare l'ultimo contenuto reale
- Rimuove automaticamente lo spazio bianco in fondo
- Genera un PDF di lunghezza esatta senza margini

## 🔌 API Endpoints

### `POST /api/convert-pdf`

Converte HTML in PDF.

**Request Body:**
```json
{
  "htmlContent": "<html>...</html>",
  "pageFormat": "a4" // oppure "single"
}
```

**Response:**
- Content-Type: `application/pdf`
- File PDF binario

### `POST /api/upload`

Upload di file HTML su S3 (richiede configurazione AWS).

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (HTML file)

**Response:**
```json
{
  "success": true,
  "cloudStoragePath": "html-converter/uploads/1234567890-file.html",
  "message": "File caricato con successo"
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🎨 Features dell'Editor

- **Syntax Highlighting**: Colorazione del codice HTML
- **Auto-completion**: Suggerimenti automatici
- **Line Numbers**: Numerazione righe
- **Theme**: Tema Monokai (dark)
- **Live Update**: Aggiornamento in tempo reale dell'anteprima

## 🐛 Troubleshooting

### Errore: "Failed to launch browser"

**Su Vercel:**
- Assicurati che `@sparticuz/chromium` sia installato
- Il codice rileva automaticamente Vercel e usa il pacchetto corretto

**Su VPS:**
```bash
sudo apt install chromium-browser
```

### Errore: "AWS credentials not found"

Le credenziali AWS sono **opzionali**. Se non configurate:
- L'upload su S3 non funzionerà
- La conversione PDF funziona normalmente

Per abilitare S3, configura le variabili d'ambiente AWS.

### PDF con spazi bianchi eccessivi

Usa il formato **"Single continuous page"** che rimuove automaticamente gli spazi bianchi in eccesso.

### Build fallisce con errori di dipendenze

```bash
# Reinstalla con flag per skipare Puppeteer
rm -rf node_modules package-lock.json
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

## 📝 Build da Locale

```bash
# Installa dipendenze
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Build produzione
npm run build

# Test build locale
npm start
```

## 🤝 Contribuire

Le pull request sono benvenute! Per modifiche importanti:
1. Apri prima un issue per discutere le modifiche
2. Fork il progetto
3. Crea un branch (`git checkout -b feature/AmazingFeature`)
4. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
5. Push al branch (`git push origin feature/AmazingFeature`)
6. Apri una Pull Request

## 📄 Licenza

MIT License - Copyright © 2025 The Drobot. All rights reserved.

## 🔗 Link Utili

- [Documentazione Next.js](https://nextjs.org/docs)
- [Puppeteer Docs](https://pptr.dev/)
- [Vercel Deployment](https://vercel.com/docs)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)

## 👨‍💻 Autore

**The Drobot**
- Website: [thedrobot.com](https://thedrobot.com)
- GitHub: [@TheDrobot](https://github.com/TheDrobot)

---

Sviluppato con ❤️ usando Next.js e Puppeteer
