-- Creates per-service databases for CloudRetail
-- Safe to re-run.

CREATE DATABASE IF NOT EXISTS cloudretail_users;
CREATE DATABASE IF NOT EXISTS cloudretail_products;
CREATE DATABASE IF NOT EXISTS cloudretail_orders;
CREATE DATABASE IF NOT EXISTS cloudretail_notifications;

-- Ensure the laravel user can access all service DBs
GRANT ALL PRIVILEGES ON cloudretail_users.* TO 'laravel'@'%';
GRANT ALL PRIVILEGES ON cloudretail_products.* TO 'laravel'@'%';
GRANT ALL PRIVILEGES ON cloudretail_orders.* TO 'laravel'@'%';
GRANT ALL PRIVILEGES ON cloudretail_notifications.* TO 'laravel'@'%';
FLUSH PRIVILEGES;
