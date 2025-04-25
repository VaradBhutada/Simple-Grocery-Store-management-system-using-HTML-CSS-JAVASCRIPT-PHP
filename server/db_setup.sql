-- Database setup for grocery store
CREATE DATABASE IF NOT EXISTS grocery_db;
USE grocery_db;

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(255) DEFAULT 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg'
);

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2),
  payment_status ENUM('paid', 'pending', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10,2),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);



