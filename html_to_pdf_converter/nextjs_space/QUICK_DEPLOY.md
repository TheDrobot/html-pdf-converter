# ⚡ Quick VPS Deployment Guide

Perfect! Since you have VPS hosting, we can deploy your HTML to PDF converter with full functionality. Here's the easiest way to deploy:

## 🚀 Option 1: One-Click Deployment (Recommended)

### Step 1: Upload Your Files First

Before running the deployment script, you need to get your files to the VPS. Choose one method:

**Method A: Git Repository (Easiest)**
1. Push your project to GitHub/GitLab
2. Get the repository URL

**Method B: File Upload**
1. Create a ZIP file of your `html_to_pdf_converter/extjs_space` folder
2. Upload it via SFTP or Hostinger File Manager

### Step 2: Connect to Your VPS

```bash
ssh root@your-vps-ip-address
```

### Step 3: Run the Automated Deployment Script

```bash
# Download and run the deployment script
curl -o deploy-vps.sh https://raw.githubusercontent.com/your-username/html-pdf-converter/main/deploy-vps.sh
chmod +x deploy-vps.sh
bash deploy-vps.sh
```

**Or copy-paste the script content manually** (see `deploy-vps.sh` file)

## 📋 What the Script Does Automatically:

✅ Updates your VPS system
✅ Installs Node.js 20.x
✅ Installs Chrome/Chromium (required for PDF generation)
✅ Installs all system dependencies for Puppeteer
✅ Installs PM2 process manager
✅ Installs and configures Nginx
✅ Sets up firewall
✅ Downloads and builds your application
✅ Creates environment configuration
✅ Starts your application with PM2
✅ Configures Nginx reverse proxy

## 🎯 After Deployment

1. **Access Your App**: `http://your-vps-ip`
2. **Check Status**: `pm2 status`
3. **View Logs**: `pm2 logs html-converter`
4. **Restart App**: `pm2 restart html-converter`

## 🔧 Manual Setup (If Script Fails)

If the automated script doesn't work, here's the manual version:

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install dependencies for Puppeteer
apt install -y chromium-browser xvfb fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxss1 libxtst6 xdg-utils nginx

# 4. Install PM2
npm install -g pm2

# 5. Create app directory
mkdir -p /var/www/html-converter
cd /var/www/html-converter

# 6. Clone your repository (replace with your URL)
git clone https://github.com/your-username/your-repo.git .

# 7. Install and build
cd extjs_space
npm ci --production
npm run build

# 8. Create environment file
cat > .env.production << EOF
NODE_ENV=production
NEXT_OUTPUT_MODE=standalone
CHROME_PATH=/usr/bin/chromium-browser
NEXT_PUBLIC_APP_URL=http://$(curl -s ifconfig.me)
EOF

# 9. Start with PM2
pm2 start npm --name "html-converter" -- start

# 10. Configure Nginx
cat > /etc/nginx/sites-available/html-converter << EOF
server {
    listen 80;
    server_name $(curl -s ifconfig.me);
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
    }
}
EOF

# Enable and restart Nginx
ln -sf /etc/nginx/sites-available/html-converter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

## 🔍 Troubleshooting

**Issue 1: "chromium-browser not found"**
```bash
# Install Chrome manually
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
apt update
apt install -y google-chrome-stable
```

**Issue 2: Permission denied**
```bash
# Make sure you're running as root
sudo su
```

**Issue 3: Port 3000 not accessible**
```bash
# Check if app is running
pm2 status
# Check logs
pm2 logs html-converter
# Restart
pm2 restart html-converter
```

## 🌟 Domain Setup (Optional)

Once deployed, you can add your domain:

1. **Update Nginx config**: Edit `/etc/nginx/sites-available/html-converter`
2. **Replace server_name** with your domain
3. **Restart Nginx**: `systemctl restart nginx`
4. **Add SSL**: `certbot --nginx -d yourdomain.com`

## 💡 Pro Tips

1. **Monitor your app**: `pm2 monit`
2. **Set up backups**: Regular backups of `/var/www/html-converter`
3. **SSL Certificate**: Use Let's Encrypt for HTTPS
4. **Domain pointing**: Point your domain's A record to your VPS IP

## 🎉 Success!

Your HTML to PDF converter will be accessible at `http://your-vps-ip` with full functionality including:
- HTML to PDF conversion
- Real-time preview
- File uploads
- Multiple PDF formats

The automated script handles all the complex setup for you. Just run it and you're done!