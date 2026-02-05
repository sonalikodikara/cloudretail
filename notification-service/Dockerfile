FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Ensure Laravel can write logs
RUN mkdir -p storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

# Expose port
EXPOSE 8000

# Start service
CMD php artisan serve --host=0.0.0.0 --port=8000