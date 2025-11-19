# HTML to PDF Converter

A modern web application that converts HTML content to PDF files with real-time preview and multiple export formats.

## Features

- 🖥️ Live HTML editor with syntax highlighting
- 👁️ Real-time preview of HTML content
- 📄 PDF generation in A4 or single continuous page format
- 📤 HTML file upload support
- 🎨 Modern, responsive UI with dark/light theme
- ⚡ Fast conversion using Puppeteer
- ☁️ Optional cloud storage integration

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI components
- **PDF Generation**: Puppeteer, pdf-lib, Sharp
- **Code Editor**: Ace Editor
- **Database**: PostgreSQL with Prisma (optional)
- **Cloud Storage**: AWS S3 (optional)

## Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) PostgreSQL database
- (Optional) AWS S3 bucket

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd html-to-pdf-converter
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:

```env
# Required for production
NODE_ENV=development

# AWS S3 (optional - for file uploads)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
AWS_FOLDER_PREFIX=html-converter/

# Database (optional)
DATABASE_URL="postgresql://username:password@localhost:5432/html_converter"

# Chrome path for production
CHROME_PATH=/usr/bin/chromium-browser
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` for production builds |
| `AWS_ACCESS_KEY_ID` | No | AWS access key for S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | No | AWS secret key for S3 uploads |
| `AWS_BUCKET_NAME` | No | S3 bucket name |
| `AWS_REGION` | No | AWS region (default: us-east-1) |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `CHROME_PATH` | No | Path to Chrome/Chromium binary |

## Hostinger Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Endpoints

- `POST /api/convert-pdf` - Convert HTML to PDF
- `POST /api/upload` - Upload HTML file to cloud storage
- `GET /api/health` - Health check endpoint

## PDF Generation Options

The converter supports two PDF formats:

1. **A4 Format** - Standard A4 pages with automatic pagination
2. **Single Continuous Page** - One long page without breaks

## Troubleshooting

### Puppeteer Issues

If you encounter Puppeteer-related errors in production:

1. Ensure system Chrome/Chromium is installed
2. Set the `CHROME_PATH` environment variable
3. Verify sandbox permissions

### Memory Issues

For large HTML files, increase Node.js memory:

```bash
export NODE_OPTIONS="--max_old_space_size=4096"
npm start
```

## License

MIT License - see LICENSE file for details.