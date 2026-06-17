#!/bin/bash
set -e

# ============================================
# react2shell Docker 구축 스크립트
# CentOS 7 등 구형 OS에서 사용
# ============================================

echo "[*] react2shell Docker 구축"

# Docker 설치 (없으면)
if ! command -v docker &> /dev/null; then
    echo "[1/3] Docker 설치 중..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

# docker-compose 설치 (없으면)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "[2/3] docker-compose 설치 중..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 빌드 & 실행
echo "[3/3] 빌드 & 실행..."
cd "$(dirname "$0")"

if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

SERVER_IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "============================================"
echo " 구축 완료!"
echo ""
echo " 웹:    http://${SERVER_IP}:3000"
echo " 로그인: web / web"
echo " 설정:  컨테이너 내부 /app/app/db.config.ts"
echo ""
echo " exploit:"
echo "   python3 exploit.py http://${SERVER_IP}:3000"
echo "   cat /app/app/db.config.ts"
echo "============================================"
