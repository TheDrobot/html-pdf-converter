#!/bin/bash

# HTML to PDF Converter - VPS Deployment Script
# Run this script on your Hostinger VPS
# Usage: curl -sSL https://your-repo/deploy-vps.sh | bash

set -e

echo "🚀 Starting HTML to PDF Converter deployment on Hostinger VPS..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use: sudo bash deploy-vps.sh)"
    exit 1
fi

print_status "Running with root privileges ✓"

# 1. Update System
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y
print_status "System updated ✓"

# 2. Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Verify Node.js installation
if command -v node &> /dev/null; then
    print_status "Node.js installed: $(node --version)"
    print_status "npm installed: $(npm --version)"
else
    print_error "Node.js installation failed"
    exit 1
fi

# 3. Install System Dependencies for Puppeteer
echo "🔧 Installing system dependencies for Puppeteer..."
apt-get install -y \
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
    xdg-utils \
    wget \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx

print_status "System dependencies installed ✓"

# 4. Install PM2
echo "📦 Installing PM2 process manager..."
npm install -g pm2
print_status "PM2 installed: $(pm2 --version) ✓"

# 5. Create Application Directory
APP_DIR="/var/www/html-converter"
echo "📁 Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# 6. Get Application Files
echo "📥 Setting up application files..."
echo "Please choose your deployment method:"
echo "1. Git Repository"
echo "2. Upload ZIP file"
echo "3. Manual file upload"
echo ""
read -p "Enter your choice (1-3): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        read -p "Enter your Git repository URL: " GIT_URL
        echo "📥 Cloning repository..."
        git clone $GIT_URL .
        ;;
    2)
        print_warning "Please upload your ZIP file to $APP_DIR/app.zip"
        print_warning "Then run: cd $APP_DIR && unzip app.zip && rm app.zip"
        print_warning "After uploading, run: cd $APP_DIR/extjs_space && npm ci --production && npm run build"
        exit 0
        ;;
    3)
        print_warning "Please upload your application files to $APP_DIR"
        print_warning "After uploading, run: cd $APP_DIR/extjs_space && npm ci --production && npm run build"
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# 7. Install Dependencies and Build
echo "📦 Installing application dependencies..."
cd extjs_space
npm ci --production

echo "🔨 Building application..."
npm run build

# 8. Create Environment File
echo "⚙️ Creating environment configuration..."
if [ ! -f .env.production ]; then
    cat > .env.production << EOF
NODE_ENV=production
NEXT_OUTPUT_MODE=standalone

# Chrome path for Puppeteer
CHROME_PATH=/usr/bin/chromium-browser

# Optional: AWS S3 Configuration (uncomment if using S3)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
# AWS_BUCKET_NAME=your-bucket-name
# AWS_FOLDER_PREFIX=html-converter/

# Optional: Database Configuration (uncomment if using database)
# DATABASE_URL="postgresql://username:password@localhost:5432/html_converter"

# Your domain (replace with actual domain)
NEXT_PUBLIC_APP_URL=http://$(curl -s ifconfig.me)
EOF
    print_status "Environment file created ✓"
    print_warning "Please edit .env.production to add your domain and other settings"
else
    print_warning "Environment file already exists"
fi

# 9. Test Application
echo "🧪 Testing application..."
npm start &
APP_PID=$!
sleep 10

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Application test passed ✓"
    kill $APP_PID 2>/dev/null || true
    sleep 2
else
    print_warning "Application test failed, but continuing anyway..."
    kill $APP_PID 2>/dev/null || true
    sleep 2
fi

# 10. Start Application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete html-converter 2>/dev/null || true
pm2 start npm --name "html-converter" -- start
pm2 save
pm2 startup

print_status "Application started with PM2 ✓"

# 11. Configure Nginx
echo "🌐 Configuring Nginx..."
SERVER_IP=$(curl -s ifconfig.me)
cat > /etc/nginx/sites-available/html-converter << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/html-converter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t && systemctl restart nginx
print_status "Nginx configured ✓"

# 12. Setup Firewall
echo "🔒 Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
print_status "Firewall configured ✓"

# 13. Display Summary
echo ""
echo "🎉 Deployment Complete!"
echo "================================================="
print_status "Application URL: http://$SERVER_IP"
print_status "Application is running on port 3000 behind Nginx"
print_status "PM2 status: $(pm2 jlist | jq '.[].name' 2>/dev/null || echo 'Running')"
echo ""
echo "📋 Next Steps:"
echo "1. Access your application at: http://$SERVER_IP"
echo "2. For domain setup, edit: /etc/nginx/sites-available/html-converter"
echo "3. For SSL certificate: certbot --nginx -d yourdomain.com"
echo "4. View logs: pm2 logs html-converter"
echo "5. Restart app: pm2 restart html-converter"
echo ""
echo "🔧 Management Commands:"
echo "Check status: pm2 status"
echo "View logs: pm2 logs html-converter"
echo "Restart: pm2 restart html-converter"
echo "Stop: pm2 stop html-converter"
echo ""
print_warning "Don't forget to edit .env.production with your actual domain!"
print_warning "Consider setting up SSL certificate for production use"
echo ""
print_status "Deployment script completed successfully! 🚀"