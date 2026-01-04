# 로컬 개발 가이드

## 시작하기

```bash
pnpm install
pnpm dev
```

http://localhost:5173 에서 확인

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 빌드 |
| `pnpm typecheck` | 타입 체크 |

## 개발 서버

turborepo가 모든 앱의 dev 서버를 병렬로 실행합니다.

```bash
# 전체 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=web
```

## Hot Reload

- React 컴포넌트 수정 → 자동 갱신
- CSS 수정 → 즉시 반영
- 서버 코드 수정 → 자동 재시작

## 디버깅

```bash
# 상세 로그
DEBUG=* pnpm dev
```
