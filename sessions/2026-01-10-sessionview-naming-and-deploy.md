---
title: SessionView 네이밍 및 Cloudflare 배포
date: 2026-01-10
duration: ~30min
---

## Summary

GitHub 저장소의 세션 리포트를 조회하는 웹앱의 이름을 `SessionView`로 결정하고 Cloudflare Workers에 배포 완료.

## What We Did

### 1. 배포 상태 점검
- 기존 배포 없음 확인 (`react-router-app` Worker 미존재)
- wrangler 로그인 상태 확인 (choigawoon@gmail.com)

### 2. 기술 스택 파악
- React Router 7 + Cloudflare Workers
- Tailwind CSS v4 (shadcn/ui 미사용)
- Vite 7 + Turborepo

### 3. 앱 네이밍: SessionView
- 네이밍 워크플로우 진행
  - 핵심 가치: 조회(View), 탐색, 열람
  - 메타포: 창/렌즈, 책/도서관
  - 후보: Viewify, Glassify, SessionLens, SessionView
- 미국 문화권 적합성 검토
  - `[대상]View` 패턴: TableView, GridView, DataView 등 기술 업계에서 친숙
- 최종 선택: **SessionView** (직관적, 설명 필요 없음)

### 4. 배포
- `wrangler.jsonc`: name → `sessionview`
- `home.tsx`: 타이틀/헤더 → `SessionView`
- URL: https://sessionview.k-codepoet.workers.dev

### 5. Workers Subdomain 변경
- `choigawoon.workers.dev` → `k-codepoet.workers.dev`
- Cloudflare Dashboard에서 수동 변경 (모든 Workers URL 자동 변경)

### 6. PR Merge
- PR #1: https://github.com/k-codepoet/session-report-viewer/pull/1

## Outputs

| 파일 | 변경 내용 |
|------|-----------|
| `apps/web/wrangler.jsonc` | name: `sessionview` |
| `apps/web/app/routes/home.tsx` | title/header: `SessionView` |

## Final Result

- **Live URL**: https://sessionview.k-codepoet.workers.dev
- **GitHub**: https://github.com/k-codepoet/session-report-viewer

## Next Actions

없음 (완료)
