#!/bin/bash

# Build script for Hostinger deployment
echo "🚀 Starting build process for HTML to PDF Converter..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building Next.js application..."
npm run build

# Install additional system dependencies for Puppeteer
if command -v apt-get &> /dev/null; then
    echo "🔧 Installing system dependencies for Puppeteer..."
    sudo apt-get update
    sudo apt-get install -y \
        chromium-browser \
        xvfb \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libatspi2.0-0 \
        libcups2 \
        libdbus-1-3 \
        libdrm2 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libxss1 \
        libxtst6 \
        xdg-utils
fi

echo "✅ Build completed successfully!"
echo "📁 Build output is in the .next directory"
echo "🌐 Ready for deployment!"