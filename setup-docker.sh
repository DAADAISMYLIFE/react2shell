#!/bin/bash
set -e

# ============================================
# react2shell Docker 구축 스크립트
# CentOS 7 등 구형 OS에서 사용
# 구성: nginx(호스트:80) → Docker(Next.js:3000 + MySQL)
# ============================================

SERVER_IP="$(hostname -I | awk '{print $1}')"

echo "============================================"
echo " react2shell Docker 구축"
echo " IP: $SERVER_IP"
echo "============================================"

# ----------------------------
# 1. Docker 설치
# ----------------------------
if ! command -v docker &> /dev/null; then
    echo "[1/4] Docker 설치 중..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
else
    echo "[1/4] Docker 이미 설치됨"
fi

# docker-compose 설치 (없으면)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "  docker-compose 설치 중..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# ----------------------------
# 2. nginx 설치 & 설정
# ----------------------------
echo "[2/4] nginx 설정 중..."

if command -v apt &> /dev/null; then
    apt install -y nginx 2>/dev/null
elif command -v yum &> /dev/null; then
    yum install -y epel-release 2>/dev/null || true
    yum install -y nginx 2>/dev/null
fi

# nginx 설정
if [ -d /etc/nginx/sites-available ]; then
    tee /etc/nginx/sites-available/react2shell > /dev/null <<NGINX
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
    ln -sf /etc/nginx/sites-available/react2shell /etc/nginx/sites-enabled/react2shell
    rm -f /etc/nginx/sites-enabled/default
else
    tee /etc/nginx/conf.d/react2shell.conf > /dev/null <<NGINX
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
fi

# SELinux 처리 (CentOS)
if command -v setsebool &> /dev/null; then
    setsebool -P httpd_can_network_connect 1 2>/dev/null || true
fi

# 방화벽 80 포트 오픈
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
fi

nginx -t && (systemctl reload nginx 2>/dev/null || systemctl start nginx)
systemctl enable nginx

# ----------------------------
# 3. Docker 빌드 & 실행
# ----------------------------
echo "[3/4] Docker 빌드 & 실행..."
cd "$(dirname "$0")"

if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# ----------------------------
# 4. 확인
# ----------------------------
echo "[4/4] 확인 중..."
sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/shop | grep -q "200"; then
    STATUS="정상"
else
    STATUS="아직 기동 중일 수 있음 (1~2분 대기)"
fi

echo ""
echo "============================================"
echo " 구축 완료! ($STATUS)"
echo ""
echo " 웹:      http://${SERVER_IP} (nginx:80 → docker:3000)"
echo " 로그인:  web / web"
echo " 로그:    /var/log/nginx/react2shell_access.log"
echo " config:  컨테이너 내부 /app/app/db.config.ts"
echo ""
echo " exploit:"
echo "   python3 exploit.py http://${SERVER_IP}"
echo "   cat /app/app/db.config.ts"
echo "============================================"
