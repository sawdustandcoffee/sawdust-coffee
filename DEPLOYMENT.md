# Sawdust & Coffee Woodworking - Deployment Guide

This guide covers deploying the Sawdust & Coffee e-commerce application to a production environment.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Backend Deployment (Laravel)](#backend-deployment-laravel)
4. [Frontend Deployment (React)](#frontend-deployment-react)
5. [Database Setup](#database-setup)
6. [Stripe Configuration](#stripe-configuration)
7. [Post-Deployment](#post-deployment)
8. [Environment Variables](#environment-variables)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Requirements

**Backend (Laravel):**
- PHP 8.3 or higher
- Composer 2.x
- MySQL 8.0 or higher
- Apache 2.4+ or Nginx 1.18+
- SSL Certificate (required for Stripe)

**PHP Extensions Required:**
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- Tokenizer
- XML

**Frontend (React):**
- Node.js 18.x or higher
- npm 9.x or higher

**Recommended Server Specs:**
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ SSD storage
- Ubuntu 22.04 LTS or similar

---

## Pre-Deployment Checklist

- [ ] Server provisioned with required software
- [ ] Domain name configured and DNS pointing to server
- [ ] SSL certificate installed (Let's Encrypt recommended)
- [ ] MySQL database created
- [ ] Database user created with appropriate permissions
- [ ] Stripe account created
- [ ] Stripe API keys obtained (live keys)
- [ ] Email service configured (for order notifications)
- [ ] Backup solution in place

---

## Backend Deployment (Laravel)

### 1. Clone Repository

```bash
cd /var/www
git clone <repository-url> sawdust-coffee
cd sawdust-coffee/backend
```

### 2. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update the following variables:
```env
APP_NAME="Sawdust & Coffee Woodworking"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_secure_password

STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS="info@sawdustandcoffee.com"
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations and Seeders

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 6. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/sawdust-coffee
sudo chmod -R 755 /var/www/sawdust-coffee
sudo chmod -R 775 /var/www/sawdust-coffee/backend/storage
sudo chmod -R 775 /var/www/sawdust-coffee/backend/bootstrap/cache
```

### 7. Configure Web Server

**Apache (.htaccess):**

The Laravel public folder already includes an `.htaccess` file. Ensure `mod_rewrite` is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**Apache Virtual Host Example:**

```apache
<VirtualHost *:80>
    ServerName api.yourdomain.com
    ServerAdmin admin@yourdomain.com
    DocumentRoot /var/www/sawdust-coffee/backend/public

    <Directory /var/www/sawdust-coffee/backend/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/sawdust-error.log
    CustomLog ${APACHE_LOG_DIR}/sawdust-access.log combined

    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName api.yourdomain.com
    ServerAdmin admin@yourdomain.com
    DocumentRoot /var/www/sawdust-coffee/backend/public

    <Directory /var/www/sawdust-coffee/backend/public>
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/privkey.pem
    SSLCertificateChainFile /path/to/chain.pem

    ErrorLog ${APACHE_LOG_DIR}/sawdust-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/sawdust-ssl-access.log combined
</VirtualHost>
```

### 8. Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Frontend Deployment (React)

### 1. Install Dependencies

```bash
cd /var/www/sawdust-coffee/frontend
npm ci --production
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
```

### 3. Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### 4. Deploy Build Files

**Option A: Separate Frontend Server (Recommended)**

Configure a separate Apache/Nginx virtual host pointing to the `dist` folder.

**Apache Virtual Host for Frontend:**

```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAdmin admin@yourdomain.com
    DocumentRoot /var/www/sawdust-coffee/frontend/dist

    <Directory /var/www/sawdust-coffee/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/privkey.pem
    SSLCertificateChainFile /path/to/chain.pem

    ErrorLog ${APACHE_LOG_DIR}/sawdust-frontend-error.log
    CustomLog ${APACHE_LOG_DIR}/sawdust-frontend-access.log combined
</VirtualHost>
```

**Option B: Serve from Laravel Public Folder**

```bash
cp -r dist/* /var/www/sawdust-coffee/backend/public/
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE sawdust_coffee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Database User

```sql
CREATE USER 'sawdust_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON sawdust_coffee.* TO 'sawdust_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Run Migrations

```bash
cd /var/www/sawdust-coffee/backend
php artisan migrate --force
```

### 4. Seed Initial Data

```bash
php artisan db:seed --class=AdminUserSeeder
php artisan db:seed --class=ProductCategorySeeder
php artisan db:seed --class=SiteContentSeeder
```

**Default Admin Credentials:**
- Email: `admin@sawdustandcoffee.com`
- Password: `password`

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## Stripe Configuration

### 1. Get Live API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle to "Live mode" (switch in top right)
3. Go to Developers → API Keys
4. Copy "Publishable key" and "Secret key"
5. Update `.env` file with live keys

### 2. Configure Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Set URL: `https://api.yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret"
6. Update `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 3. Test Webhook

```bash
stripe listen --forward-to https://api.yourdomain.com/api/webhooks/stripe
```

---

## Post-Deployment

### 1. Update Admin Password

1. Log in to admin panel: `https://yourdomain.com/admin`
2. Use default credentials (see Database Setup)
3. Change password immediately

### 2. Add Products and Content

1. Add product categories
2. Upload products with images
3. Upload gallery items
4. Update site content (homepage, about, services)

### 3. Test Critical Flows

- [ ] Browse products
- [ ] Add to cart
- [ ] Complete checkout with Stripe test card
- [ ] Verify order created in admin
- [ ] Test contact form
- [ ] Test quote request form
- [ ] Verify email notifications

### 4. Configure Monitoring

- Set up server monitoring (CPU, RAM, disk)
- Configure application error logging
- Set up uptime monitoring
- Enable Laravel log monitoring

### 5. Security Hardening

```bash
# Disable directory listing
echo "Options -Indexes" >> /var/www/sawdust-coffee/backend/public/.htaccess

# Set secure file permissions
find /var/www/sawdust-coffee -type f -exec chmod 644 {} \;
find /var/www/sawdust-coffee -type d -exec chmod 755 {} \;
chmod -R 775 /var/www/sawdust-coffee/backend/storage
chmod -R 775 /var/www/sawdust-coffee/backend/bootstrap/cache
```

---

## Environment Variables

### Critical Variables

**Never commit these to Git:**
- `APP_KEY`
- `DB_PASSWORD`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAIL_PASSWORD`

### Full `.env` Template

See `backend/.env.example` for complete reference.

---

## Backup Strategy

### Database Backups

**Daily Automated Backup (Cron):**

```bash
0 2 * * * /usr/bin/mysqldump -u sawdust_user -p'password' sawdust_coffee | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

### File Backups

Backup these directories:
- `/var/www/sawdust-coffee/backend/storage/app` (uploaded files)
- `/var/www/sawdust-coffee/backend/.env` (configuration)

### Restore Procedure

```bash
# Restore database
gunzip < /backups/db-20260109.sql.gz | mysql -u sawdust_user -p sawdust_coffee

# Restore files
tar -xzf /backups/storage-20260109.tar.gz -C /var/www/sawdust-coffee/backend/storage/app
```

---

## Troubleshooting

### Issue: 500 Internal Server Error

**Check Laravel logs:**
```bash
tail -f /var/www/sawdust-coffee/backend/storage/logs/laravel.log
```

**Common causes:**
- File permissions incorrect
- Missing `.env` file
- Database connection failed
- App key not generated

### Issue: Stripe Webhook Not Working

**Test webhook manually:**
```bash
curl -X POST https://api.yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Check:**
- Webhook URL is correct in Stripe dashboard
- SSL certificate is valid
- `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- No firewall blocking Stripe IP addresses

### Issue: Frontend Not Loading

**Check:**
- Apache/Nginx configuration is correct
- SPA routing fallback configured
- Build files exist in correct directory
- API URL in frontend `.env` is correct

### Issue: Cart Not Persisting

**Check:**
- localStorage is enabled in browser
- CORS headers configured correctly
- Sanctum session working

---

## Support

For issues specific to this deployment:
- Check Laravel logs: `/var/www/sawdust-coffee/backend/storage/logs/`
- Check Apache logs: `/var/log/apache2/`
- Contact: info@sawdustandcoffee.com
- Phone: 774-836-4958

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review application logs for errors
- Check disk space usage
- Verify backups are running

**Monthly:**
- Update dependencies: `composer update` (test first!)
- Review and rotate logs
- Security audit

**Quarterly:**
- Test backup restore procedure
- Review server security patches
- Analyze performance metrics

---

**Last Updated:** January 2026
**Version:** 1.0
