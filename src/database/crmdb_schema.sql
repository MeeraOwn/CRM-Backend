USE crmdb;

DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customerId VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  brokerNumber VARCHAR(100) NOT NULL DEFAULT '',
  customerTitle VARCHAR(100) NOT NULL DEFAULT '',
  customerDisplayName VARCHAR(100) NOT NULL DEFAULT '',
  customerDOB DATE NOT NULL DEFAULT '1990-01-01',
  customerStreet VARCHAR(100) NOT NULL DEFAULT '',
  customerHouseNumber VARCHAR(100) NOT NULL DEFAULT '',
  customerPostalCode VARCHAR(100) NOT NULL DEFAULT '',
  customerCity VARCHAR(100) NOT NULL DEFAULT '',
  customerStatus VARCHAR(100) NOT NULL DEFAULT '',
  description VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_customers_customerId (customerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  customerId VARCHAR(20) DEFAULT NULL,
  subject VARCHAR(255) NOT NULL,
  art VARCHAR(20) NOT NULL,
  description TEXT,
  date_val DATE NOT NULL,
  time_val TIME NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_history_customer (customer_id),
  KEY idx_history_created_by (created_by),
  CONSTRAINT fk_history_customer
    FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_history_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_history_art
    CHECK (art IN ('appointment', 'service', 'other'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO users (first_name, last_name, email, password, role) VALUES
  ('Meera', 'R', 'admin@asmcrm.com', '$2b$10$fX6CTX4BZfeZUZ2LCnbayO2ing0RrNFUUJgCPXvPAljPxQw.iYH5u', 'Admin'),
  ('Staff', 'M', 'staff@asmcrm.com', '$2b$10$Cv3CPoQlghPliyizT5hWF.ojIfXmxs19tUQhviDIrxCtkjwHKp.B.', 'Staff');
