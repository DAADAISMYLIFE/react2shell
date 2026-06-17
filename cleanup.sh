#!/bin/bash
set -e

# ============================================
# react2shell 실습 환경 정리 스크립트
# setup.sh로 설치한 것만 중지/제거
# 기존 시스템 패키지(nginx, mysql, node)는 건드리지 않음
# ============================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo " react2shell 실습 환경 정리"
echo " APP_DIR: $APP_DIR"
echo "============================================"

# ----------------------------
# 1. react2shell 서비스 중지/제거
# ----------------------------
echo "[1/4] react2shell 서비스 정리..."
if systemctl list-unit-files | grep -q react2shell; then
    sudo systemctl stop react2shell 2>/dev/null || true
    sudo systemctl disable react2shell 2>/dev/null || true
    sudo rm -f /etc/systemd/system/react2shell.service
    sudo systemctl daemon-reload
    echo "  서비스 제거 완료"
else
    echo "  서비스 없음 (skip)"
fi

# ----------------------------
# 2. nginx 설정 제거
# ----------------------------
echo "[2/4] nginx 설정 정리..."
NGINX_CHANGED=false

if [ -f /etc/nginx/sites-enabled/react2shell ]; then
    sudo rm -f /etc/nginx/sites-enabled/react2shell
    sudo rm -f /etc/nginx/sites-available/react2shell
    NGINX_CHANGED=true
fi

if [ -f /etc/nginx/conf.d/react2shell.conf ]; then
    sudo rm -f /etc/nginx/conf.d/react2shell.conf
    NGINX_CHANGED=true
fi

if [ "$NGINX_CHANGED" = true ]; then
    sudo nginx -t 2>/dev/null && (sudo systemctl reload nginx 2>/dev/null || true)
    echo "  nginx 설정 제거 완료"
else
    echo "  react2shell nginx 설정 없음 (skip)"
fi

# ----------------------------
# 3. MySQL DB/계정 제거
# ----------------------------
echo "[3/4] MySQL DB/계정 정리..."

MYSQL_SVC="mysql"
if systemctl list-unit-files | grep -q mysqld.service; then
    MYSQL_SVC="mysqld"
fi

if systemctl is-active --quiet $MYSQL_SVC 2>/dev/null; then
    sudo mysql -u root -e "
        DROP DATABASE IF EXISTS nextech_store;
        DROP USER IF EXISTS 'nxt_admin'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null && echo "  DB/계정 제거 완료" || echo "  DB 제거 실패 (수동 확인 필요)"
else
    echo "  MySQL 미실행 (skip)"
fi

# ----------------------------
# 4. 빌드 산출물 정리
# ----------------------------
echo "[4/4] 빌드 산출물 정리..."
rm -rf "$APP_DIR/.next" 2>/dev/null
rm -rf "$APP_DIR/node_modules" 2>/dev/null
echo "  .next, node_modules 제거 완료"

echo ""
echo "============================================"
echo " 정리 완료!"
echo ""
echo " - react2shell 서비스: 제거됨"
echo " - nginx react2shell 설정: 제거됨"
echo " - MySQL nextech_store DB/계정: 제거됨"
echo " - 소스코드: 유지 (직접 삭제하세요)"
echo " - nginx, mysql, node 패키지: 유지"
echo "============================================"
