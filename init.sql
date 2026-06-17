USE nextech_store;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price INT NOT NULL,
  original_price INT,
  rating DECIMAL(2,1),
  reviews_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(10),
  user_id INT,
  rating INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id VARCHAR(10),
  quantity INT DEFAULT 1,
  status ENUM('pending','paid','shipped','delivered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS newsletter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, role) VALUES
('admin', 'NxT_sup3r_@dmin!', 'admin@nextech.local', 'admin'),
('web', 'web', 'web@nextech.local', 'user'),
('testuser', 'test1234', 'test@nextech.local', 'user');

INSERT INTO products (id, name, category, price, original_price, rating, reviews_count) VALUES
('p001', 'NexBook Pro 16', '노트북', 2890000, 3290000, 4.8, 1243),
('p002', 'NexPhone X15 Ultra', '스마트폰', 1590000, 1790000, 4.9, 3891),
('p003', 'NexPad Ultra Tab', '태블릿', 980000, 1100000, 4.7, 672),
('p004', 'NexBuds Pro 3', '이어폰', 390000, 450000, 4.6, 5210),
('p005', 'NexWatch Series 10', '스마트워치', 590000, 650000, 4.8, 2140),
('p006', 'NexStation RTX', '데스크탑', 3490000, 3890000, 4.9, 438);

INSERT INTO reviews (product_id, user_id, rating, content) VALUES
('p001', 2, 5, '영상 편집할 때 렌더링 속도가 미쳤습니다. 강력 추천!'),
('p002', 3, 4, '카메라 성능은 최고인데 배터리가 좀 아쉬움'),
('p004', 2, 5, 'ANC 성능이 역대급이에요. 지하철에서도 완벽 차단');
