# Hostinger Deployment Guide

This guide will walk you through deploying the HTML to PDF Converter on Hostinger.

## Prerequisites

- Hostinger account with VPS or Cloud Hosting
- SSH access to your server
- Node.js 18+ installed on server
- Domain name (optional)

## Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
ssh root@your-server-ip
```

### 1.2 Update System and Install Dependencies

```bash
# Update package lists
apt update && apt upgrade -y

# Install Node.js 18+ (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install system dependencies for Puppeteer
apt install -y \
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

# Install PM2 for process management
npm install -g pm2
```

### 1.3 Create Application Directory

```bash
mkdir -p /var/www/html-converter
cd /var/www/html-converter
```

## Step 2: Application Deployment

### 2.1 Upload Your Files

Choose one of these methods:

**Option A: Git Clone (Recommended)**
```bash
git clone <your-repo-url> .
```

**Option B: File Upload**
- Upload your project files using SFTP or Hostinger File Manager
- Extract the files to `/var/www/html-converter`

### 2.2 Install Dependencies

```bash
cd /var/www/html-converter/extjs_space
npm ci --production
```

### 2.3 Configure Environment Variables

```bash
# Create production environment file
nano .env.production
```

Add the following configuration:

```env
NODE_ENV=production
NEXT_OUTPUT_MODE=standalone

# Optional: AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_FOLDER_PREFIX=html-converter/

# Chrome path for Puppeteer
CHROME_PATH=/usr/bin/chromium-browser

# Your domain (if applicable)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 3: Build and Start Application

### 3.1 Build the Application

```bash
npm run build
```

### 3.2 Test Run

```bash
npm start
```

Test your application by visiting `http://your-server-ip:3000`

### 3.3 Start with PM2

```bash
# Stop the test run (Ctrl+C)

# Start with PM2
pm2 start npm --name "html-converter" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 4: Configure Web Server (Nginx)

### 4.1 Install Nginx

```bash
apt install nginx
```

### 4.2 Configure Nginx

```bash
nano /etc/nginx/sites-available/html-converter
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
```

### 4.3 Enable Site and Restart Nginx

```bash
# Enable the site
ln -s /etc/nginx/sites-available/html-converter /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 5: SSL Certificate (Optional but Recommended)

### 5.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5.3 Auto-renewal Setup

```bash
# Test auto-renewal
certbot renew --dry-run

# Add cron job for auto-renewal
crontab -e
```

Add this line:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Monitoring and Maintenance

### 6.1 Monitor PM2 Process

```bash
# Check status
pm2 status

# View logs
pm2 logs html-converter

# Restart application
pm2 restart html-converter
```

### 6.2 Set up Log Rotation

```bash
nano /etc/logrotate.d/html-converter
```

Add:
```
/var/www/html-converter/.pm2/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload all
    endscript
}
```

## Step 7: Troubleshooting

### Common Issues and Solutions

**Issue 1: Puppeteer fails to launch**
```bash
# Solution: Check Chrome installation
which chromium-browser
chromium-browser --version

# If not installed, install it
apt install chromium-browser
```

**Issue 2: Memory errors**
```bash
# Solution: Increase Node.js memory
pm2 delete html-converter
pm2 start npm --name "html-converter" -- start -- --max_old_space_size=4096
```

**Issue 3: Port 3000 not accessible**
```bash
# Solution: Check if application is running
pm2 status

# Check port
netstat -tlnp | grep 3000

# Restart PM2
pm2 restart html-converter
```

**Issue 4: Nginx 502 Bad Gateway**
```bash
# Solution: Check upstream server
curl http://localhost:3000

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

## Step 8: Performance Optimization

### 8.1 Enable Gzip Compression

Add to your Nginx configuration:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private must-revalidate auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
```

### 8.2 Set up Caching

Add to Nginx configuration:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Considerations

1. **Firewall**: Configure firewall to allow only necessary ports
2. **Updates**: Keep system and packages updated
3. **Backups**: Regular backups of your application and database
4. **Monitoring**: Set up monitoring for server resources

## Maintenance Commands

```bash
# Update application
cd /var/www/html-converter/extjs_space
git pull
npm install
npm run build
pm2 restart html-converter

# Clear PM2 logs
pm2 flush

# Check system resources
htop
df -h
free -h
```

## Support

If you encounter issues:

1. Check application logs: `pm2 logs html-converter`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify system resources: `htop`
4. Test locally before deploying

Your HTML to PDF Converter should now be running on Hostinger! 🎉