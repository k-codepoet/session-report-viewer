# 자동 배포 가이드

## GitHub 연동

### 방법 1: Cloudflare Pages (권장)

1. Cloudflare Dashboard → Pages
2. "Create a project" → "Connect to Git"
3. GitHub 저장소 선택
4. 빌드 설정:
   - Framework preset: None
   - Build command: `pnpm build`
   - Build output directory: `apps/web/build/client`
   - Root directory: `/`

### 방법 2: GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: apps/web
          command: deploy
```

## 시크릿 설정

GitHub → Settings → Secrets:
- `CF_API_TOKEN`: Cloudflare API 토큰

## 브랜치 전략

| 브랜치 | 환경 |
|--------|------|
| `main` | Production |
| `develop` | Preview |
| PR | Preview (자동) |
