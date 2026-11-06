CREATE DATABASE IF NOT EXISTS gelae CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gelae;

CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  address VARCHAR(255),
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  delivery_minutes VARCHAR(40) DEFAULT '30 a 45 min',
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  name VARCHAR(140) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  volume VARCHAR(40),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30),
  delivery_address VARCHAR(255) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('Recebido','Confirmado','Preparando','Saiu para entrega','Entregue','Cancelado') DEFAULT 'Recebido',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(140) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Dados iniciais para testar o banco. O app também possui modo demonstração local.
INSERT INTO stores (name, description, address, delivery_fee, delivery_minutes, image_url)
SELECT 'Depósito Central', 'Bebidas geladas e variedade para todos os momentos.', 'Centro', 6.00, '25 a 40 min',
'https://images.unsplash.com/photo-1513558161293-c t8a?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name='Depósito Central');

INSERT INTO stores (name, description, address, delivery_fee, delivery_minutes, image_url)
SELECT 'Adega do Bairro', 'Seu depósito de confiança, pertinho de você.', 'Bairro Novo', 5.00, '30 a 45 min',
'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name='Adega do Bairro');
