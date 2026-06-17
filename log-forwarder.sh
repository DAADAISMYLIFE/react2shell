#!/bin/bash

# ============================================
# react2shell nginx 로그 포워더
# react2shell_access.log → 로그 수집 서버 실시간 전송
#
# 사용법:
#   sudo ./log-forwarder.sh http://10.100.5.12:8081/logs
# ============================================

if [ -z "$1" ]; then
    echo "Usage: sudo $0 <로그 수집 서버 URL>"
    echo "Example: sudo $0 http://10.100.5.12:8081/logs"
    exit 1
fi

LOG_FILE="/var/log/nginx/react2shell_access.log"
LOG_SERVER="$1"

echo "[*] 로그 포워더 시작"
echo "    로그: ${LOG_FILE}"
echo "    전송: ${LOG_SERVER}"
echo ""

tail -F "$LOG_FILE" | while read line; do
    curl -s -X POST -H "Content-Type: text/plain" -d "$line" "$LOG_SERVER" &
done
