# React2Shell - CVE-2025-55182 실습 환경

CVE-2025-55182 (React Flight Protocol Deserialization RCE) 보안 실습용 취약 웹 애플리케이션입니다.

Next.js 15 + React 19 기반 쇼핑몰(NexTech Store)로 구성되어 있으며, RCE를 통한 DB 크레덴셜 탈취 및 횡이동까지의 시나리오를 실습할 수 있습니다.

> **All code in this repository was written by Claude (Anthropic).** This project is intended solely for authorized security training and education. Do NOT use against systems you do not own or have explicit permission to test.

---

## 구성 요소

| 항목 | 설명 |
|------|------|
| **웹 앱** | Next.js 15.2.4 + React 19.1.0 (NexTech Store 쇼핑몰) |
| **DB** | MySQL 8 (`nextech_store`) |
| **웹서버** | nginx (리버스 프록시, :80 → :3000) |
| **실행 방식** | 호스트 직접 실행 (Docker 아님 — 횡이동 실습 가능) |
| **취약점** | CVE-2025-55182 — `"use server"` 서버 액션의 Flight 프로토콜 역직렬화 RCE |

## 실습 시나리오

```
웹 접속 (web/web 로그인)
    ↓
CVE-2025-55182 RCE (exploit.py)
    ↓
cat app/db.config.ts → DB 크레덴셜 탈취
    ↓
mysql -u nxt_admin -p'Nxt@S3cure#2025!' nextech_store
    ↓
SELECT * FROM users; → admin 비밀번호 등 민감 데이터 확인
    ↓
횡이동
```

---

## 설치 방법

### Ubuntu (22.04 / 24.04)

```bash
git clone https://github.com/DAADAISMYLIFE/react2shell.git
cd react2shell
sudo ./setup.sh
```

### CentOS / Rocky / AlmaLinux (7, 8, 9)

```bash
# git 설치 (없는 경우)
sudo yum install -y git

# 레포 클론
git clone https://github.com/DAADAISMYLIFE/react2shell.git
cd react2shell
sudo ./setup.sh
```

> **CentOS 참고사항**
> - setup.sh가 OS를 자동 감지하여 `yum` 기반으로 설치합니다.
> - MySQL Community 저장소가 자동 추가됩니다.
> - SELinux 환경에서 nginx 프록시를 위해 `httpd_can_network_connect`가 활성화됩니다.
> - firewalld가 있으면 80 포트가 자동으로 열립니다.
> - Node.js 18 미만이면 자동으로 Node.js 20으로 업그레이드됩니다.

### 설치 완료 후

```
============================================
 구축 완료!

 웹:    http://<서버IP>
 로그인: web / web
 DB:    nextech_store (nxt_admin)
 설정:  <경로>/app/db.config.ts
============================================
```

---

## Exploit 사용법

```bash
# requests 모듈 필요
pip3 install requests

# 실행
python3 exploit.py http://<타겟IP>
```

```
[*] Target: http://192.168.123.10
[*] Checking CVE-2025-55182 vulnerability...
[+] VULNERABLE! RCE confirmed as: web
[+] Interactive shell ready. Type 'exit' to quit.

web@react2shell $ whoami
web
web@react2shell $ cat app/db.config.ts
// NexTech Store - Database Configuration
...
web@react2shell $ exit
[*] Bye.
```

---

## 환경 정리

실습이 끝나면 setup.sh로 추가된 항목만 깔끔하게 제거합니다. 기존 시스템 패키지(nginx, mysql, node)는 건드리지 않습니다.

```bash
sudo ./cleanup.sh
```

---

## 파일 구조

```
react2shell/
├── app/
│   ├── actions.ts          # "use server" 서버 액션 (MySQL 연동)
│   ├── db.config.ts        # DB 크레덴셜 (탈취 대상 설정 파일)
│   ├── db.ts               # MySQL 커넥션 풀
│   ├── api/health/route.ts # 서버 상태 API
│   ├── login/page.tsx      # 로그인 페이지 (web/web)
│   ├── shop/page.tsx       # 메인 쇼핑몰 페이지
│   ├── layout.tsx
│   └── page.tsx
├── setup.sh                # 환경 구축 (Ubuntu / CentOS 지원)
├── cleanup.sh              # 환경 정리
├── exploit.py              # CVE-2025-55182 인터랙티브 exploit
├── package.json
└── tsconfig.json
```

---

## 주의사항

- 이 프로젝트는 **보안 교육 및 인가된 실습 환경 전용**입니다.
- 허가 없는 시스템에 exploit을 사용하는 것은 **불법**입니다.
- 외부 네트워크에 노출하지 마세요. 실습 후 반드시 `cleanup.sh`로 정리하세요.
- 모든 코드는 **Claude (Anthropic)**가 작성했습니다.
