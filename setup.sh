#!/bin/bash
set -e

# ============================================
# react2shell 실습 환경 자동 구축 스크립트
# 대상: Ubuntu 22.04/24.04, CentOS 7/8/9, Rocky, AlmaLinux
# 구성: Next.js + MySQL + nginx (호스트 직접 실행)
# ============================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_USER="$(whoami)"
SERVER_IP="$(hostname -I | awk '{print $1}')"

# OS 감지
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID="$ID"
else
    echo "[!] /etc/os-release 없음. 지원되지 않는 OS입니다."
    exit 1
fi

case "$OS_ID" in
    ubuntu|debian) PKG="apt" ;;
    centos|rocky|almalinux|rhel|fedora) PKG="yum" ;;
    *)
        echo "[!] 지원되지 않는 OS: $OS_ID"
        exit 1
        ;;
esac

echo "============================================"
echo " react2shell 실습 환경 구축"
echo " OS:      $OS_ID ($PKG)"
echo " APP_DIR: $APP_DIR"
echo " USER:    $APP_USER"
echo " IP:      $SERVER_IP"
echo "============================================"

# ----------------------------
# 1. 시스템 패키지 설치
# ----------------------------
echo "[1/6] 패키지 설치 중..."

install_node20() {
    echo "  Node.js 20 설치 중..."
    if [ "$PKG" = "apt" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    else
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo -E bash -
        sudo yum install -y nodejs
    fi
}

if [ "$PKG" = "apt" ]; then
    sudo apt update -qq
    sudo apt install -y mysql-server nginx curl 2>/dev/null

    if ! command -v node &> /dev/null; then
        install_node20
    elif [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]; then
        echo "  Node.js $(node -v) 감지 — Next.js 15는 Node.js 18+ 필요. 업그레이드합니다."
        install_node20
    fi

elif [ "$PKG" = "yum" ]; then
    # EPEL 활성화
    sudo yum install -y epel-release 2>/dev/null || true

    # MySQL 저장소 추가 (없으면)
    if ! rpm -qa | grep -q mysql-community-release; then
        CENTOS_VER=$(rpm -E %{rhel} 2>/dev/null || echo "8")
        sudo yum install -y "https://dev.mysql.com/get/mysql80-community-release-el${CENTOS_VER}-1.noarch.rpm" 2>/dev/null || true
        # GPG 키 임포트
        sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2023 2>/dev/null || true
    fi

    sudo yum install -y mysql-community-server nginx curl 2>/dev/null

    if ! command -v node &> /dev/null; then
        install_node20
    elif [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]; then
        echo "  Node.js $(node -v) 감지 — Next.js 15는 Node.js 18+ 필요. 업그레이드합니다."
        install_node20
    fi

    # SELinux: nginx가 upstream으로 프록시 가능하게
    if command -v setsebool &> /dev/null; then
        sudo setsebool -P httpd_can_network_connect 1 2>/dev/null || true
    fi

    # 방화벽 80 포트 오픈
    if command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-service=http 2>/dev/null || true
        sudo firewall-cmd --reload 2>/dev/null || true
    fi
fi

echo "  node: $(node -v), npm: $(npm -v)"

# ----------------------------
# 2. MySQL 설정
# ----------------------------
echo "[2/6] MySQL 설정 중..."

# MySQL 서비스 이름 (CentOS는 mysqld, Ubuntu는 mysql)
if [ "$PKG" = "yum" ]; then
    MYSQL_SVC="mysqld"
else
    MYSQL_SVC="mysql"
fi

sudo mkdir -p /var/lib/mysql-files
sudo chown mysql:mysql /var/lib/mysql-files
sudo chmod 750 /var/lib/mysql-files

# MariaDB 잔여 설정 제거 (충돌 방지)
if [ -d /etc/mysql/mariadb.conf.d ]; then
    sudo rm -f /etc/mysql/mariadb.conf.d/provider_*.cnf
fi
sudo rm -f /etc/mysql/FROZEN

# MySQL 시작 시도
if ! sudo systemctl restart $MYSQL_SVC 2>/dev/null; then
    echo "  MySQL 초기화 필요..."
    sudo rm -rf /var/lib/mysql/*
    sudo mysqld --initialize-insecure --user=mysql 2>/dev/null
    sudo systemctl start $MYSQL_SVC
fi
sudo systemctl enable $MYSQL_SVC

# CentOS에서 임시 비밀번호 처리
if [ "$PKG" = "yum" ]; then
    TEMP_PW=$(sudo grep 'temporary password' /var/log/mysqld.log 2>/dev/null | tail -1 | awk '{print $NF}')
    if [ -n "$TEMP_PW" ]; then
        # 임시 비밀번호가 있으면 비밀번호 정책 완화 후 리셋
        sudo mysql -u root -p"$TEMP_PW" --connect-expired-password -e "
            ALTER USER 'root'@'localhost' IDENTIFIED BY 'TempRoot@1234';
            SET GLOBAL validate_password.policy=LOW;
            SET GLOBAL validate_password.length=4;
            ALTER USER 'root'@'localhost' IDENTIFIED BY '';
        " 2>/dev/null || true
    fi
fi

# DB, 계정, 테이블 생성
sudo mysql -u root <<'EOSQL'
CREATE DATABASE IF NOT EXISTS nextech_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nxt_admin'@'localhost' IDENTIFIED BY 'Nxt@S3cure#2025!';
GRANT ALL PRIVILEGES ON nextech_store.* TO 'nxt_admin'@'localhost';
FLUSH PRIVILEGES;

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

INSERT IGNORE INTO users (id, username, password, email, role) VALUES
(1, 'admin', 'NxT_sup3r_@dmin!', 'admin@nextech.local', 'admin'),
(2, 'web', 'web', 'web@nextech.local', 'user'),
(3, 'testuser', 'test1234', 'test@nextech.local', 'user');

INSERT IGNORE INTO products (id, name, category, price, original_price, rating, reviews_count) VALUES
('p001', 'NexBook Pro 16', '노트북', 2890000, 3290000, 4.8, 1243),
('p002', 'NexPhone X15 Ultra', '스마트폰', 1590000, 1790000, 4.9, 3891),
('p003', 'NexPad Ultra Tab', '태블릿', 980000, 1100000, 4.7, 672),
('p004', 'NexBuds Pro 3', '이어폰', 390000, 450000, 4.6, 5210),
('p005', 'NexWatch Series 10', '스마트워치', 590000, 650000, 4.8, 2140),
('p006', 'NexStation RTX', '데스크탑', 3490000, 3890000, 4.9, 438);

INSERT IGNORE INTO reviews (id, product_id, user_id, rating, content) VALUES
(1, 'p001', 2, 5, '영상 편집할 때 렌더링 속도가 미쳤습니다. 강력 추천!'),
(2, 'p002', 3, 4, '카메라 성능은 최고인데 배터리가 좀 아쉬움'),
(3, 'p004', 2, 5, 'ANC 성능이 역대급이에요. 지하철에서도 완벽 차단');
EOSQL

echo "  MySQL 설정 완료"

# ----------------------------
# 3. npm install + build
# ----------------------------
echo "[3/6] npm install + build..."
cd "$APP_DIR"
npm install 2>/dev/null
npm run build 2>&1 | tail -5

# ----------------------------
# 4. nginx 설정
# ----------------------------
echo "[4/6] nginx 설정 중..."

if [ "$PKG" = "apt" ]; then
    # Ubuntu: sites-available/sites-enabled 구조
    sudo tee /etc/nginx/sites-available/react2shell > /dev/null <<NGINX
server {
    listen 80;
    server_name $SERVER_IP;

    access_log /var/log/nginx/react2shell_access.log;
    error_log /var/log/nginx/react2shell_error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
    sudo ln -sf /etc/nginx/sites-available/react2shell /etc/nginx/sites-enabled/react2shell
    sudo rm -f /etc/nginx/sites-enabled/default

elif [ "$PKG" = "yum" ]; then
    # CentOS: conf.d 구조
    sudo tee /etc/nginx/conf.d/react2shell.conf > /dev/null <<NGINX
server {
    listen 80;
    server_name $SERVER_IP;

    access_log /var/log/nginx/react2shell_access.log;
    error_log /var/log/nginx/react2shell_error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
    # 기본 server 블록 비활성화
    sudo sed -i '/^\s*server\s*{/,/^\s*}/s/^/#/' /etc/nginx/nginx.conf 2>/dev/null || true
fi

sudo nginx -t && (sudo systemctl reload nginx 2>/dev/null || sudo systemctl start nginx)
sudo systemctl enable nginx

# ----------------------------
# 5. systemd 서비스 등록
# ----------------------------
echo "[5/6] systemd 서비스 등록 중..."
sudo tee /etc/systemd/system/react2shell.service > /dev/null <<SERVICE
[Unit]
Description=NexTech React2Shell App
After=network.target $MYSQL_SVC.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=$(which node) $APP_DIR/node_modules/.bin/next start -p 3000
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable react2shell
sudo systemctl restart react2shell

# ----------------------------
# 6. 확인
# ----------------------------
echo "[6/6] 확인 중..."
sleep 2

if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/shop | grep -q "200"; then
    echo ""
    echo "============================================"
    echo " 구축 완료!"
    echo ""
    echo " 웹:    http://$SERVER_IP"
    echo " 로그인: web / web"
    echo " DB:    nextech_store (nxt_admin)"
    echo " 설정:  $APP_DIR/app/db.config.ts"
    echo "============================================"
else
    echo " [!] 앱이 아직 기동 중일 수 있습니다."
    echo "     sudo systemctl status react2shell 로 확인하세요."
fi
