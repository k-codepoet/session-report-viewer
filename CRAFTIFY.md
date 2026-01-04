# Session Report Viewer

gemify:wrapup으로 생성된 세션 리포트를 웹에서 볼 수 있는 뷰어 앱.

## Quick Start

```bash
pnpm install
pnpm dev
```

http://localhost:5173 에서 확인

## 기술 스택

| 항목 | 값 |
|------|---|
| 프레임워크 | React Router 7 |
| 렌더링 | SSR (Server-Side) |
| 배포 | Cloudflare Workers |
| 스타일링 | Tailwind CSS 4 |
| 빌드 | Vite 7 |

## 프로젝트 구조

```
session-report-viewer/
├── apps/
│   └── web/              # React Router 앱
│       ├── app/
│       │   ├── routes/   # 라우트 파일들
│       │   └── lib/      # 유틸리티
│       └── workers/      # Cloudflare Workers
├── packages/             # 공유 패키지 (향후)
├── turbo.json
└── pnpm-workspace.yaml
```

## URL 구조

- `/` - 랜딩 페이지 (GitHub repo URL 입력)
- `/:user/:repo` - 세션 리포트 뷰어

## 배포

```bash
pnpm --filter web deploy
```

## 가이드

- `.craftify/guides/01-local-dev.md` - 로컬 개발
- `.craftify/guides/02-cloudflare-setup.md` - Cloudflare 설정
- `.craftify/guides/03-auto-deploy.md` - 자동 배포
