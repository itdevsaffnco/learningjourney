#!/bin/sh
set -e

cd /var/www/html

# Ensure production safety
if [ -f ".env" ]; then
    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env
    sed -i 's/APP_ENV=local/APP_ENV=production/' .env
    sed -i 's/LOG_LEVEL=debug/LOG_LEVEL=error/' .env
fi

echo "==> Starting PHP-FPM..."
php-fpm -D

echo "==> Waiting for PHP-FPM to be ready..."
sleep 2

echo "==> Running database migrations..."
php artisan migrate --force 2>&1 || echo "[WARN] Migration had errors, continuing startup..."

echo "==> Clearing all caches..."
php artisan optimize:clear

echo "==> Caching for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
