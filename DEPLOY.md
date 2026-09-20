# 部署到 Render（免费）+ Postgres（免费）

本目录已改造为 **Postgres 版**，可直接部署到 Render 免费 Web Service。

## 改动清单

- `prisma/schema.prisma`：`provider` 改为 `postgresql`，`url = env("DATABASE_URL")`
- `prisma/migrations/.../migration.sql`：改为 Postgres 语法（`DATETIME` → `TIMESTAMP(3)`）
- `Dockerfile`：构建时完整装依赖 → `prisma generate` → `build` → `prune --omit=dev`
- `render.yaml`：Render Blueprint（Web Service + Postgres）
- `.env.example`：所需环境变量清单

## 部署步骤

### 1. 建数据库（二选一）

**A. 用 Render 自带 Postgres**（`render.yaml` 里已定义，最省事；注意 Render 免费库有 30 天限制）
**B. 用 [Neon](https://neon.tech) 免费库**（长期免费，推荐）：
新建 project → 复制 **Connection string**（形如 `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`）。

### 2. 推到 GitHub

```bash
cd work/chinapass-app/china-pass
git add -A && git commit -m "Postgres + Render deploy"
git remote add origin <你的仓库地址>
git push -u origin main
```

### 3. Render 部署

- 打开 https://dashboard.render.com → **New +** → **Blueprint** → 选该仓库；
- 若用 Render Postgres：直接 Apply，`DATABASE_URL` 自动注入；
  若用 Neon：把 `render.yaml` 里 `databases:` 段落删掉，手动填 `DATABASE_URL`。
- 部署时会提示填这几个变量：
  | 变量 | 取值 |
  |---|---|
  | `SHOPIFY_API_KEY` | `0dce9a73d4a5e8536ff17c7c446d5273` |
  | `SHOPIFY_API_SECRET` | Dev Dashboard → App → Settings → Credentials 里的 Client secret |
  | `SHOPIFY_APP_URL` | Render 给你的地址，如 `https://chinapass.onrender.com` |
  | `SCOPES` | `read_orders`（已在 render.yaml 里预设） |
- 首次部署后，在 Render 服务页复制 **实际的 URL**（可能带随机后缀，如 `https://chinapass-xxxx.onrender.com`）。

### 4. 回填 App URL 到 Shopify 并重新部署扩展

把 `shopify.app.toml` 里的地址改成 Render 实际 URL：

```toml
client_id = "0dce9a73d4a5e8536ff17c7c446d5273"
name = "ChinaPass"
handle = "chinapass"
application_url = "https://chinapass.onrender.com"
embedded = true

[access_scopes]
scopes = "read_orders"

[auth]
redirect_urls = [ "https://chinapass.onrender.com/api/auth/callback" ]

[webhooks]
api_version = "2026-07"

  [[webhooks.subscriptions]]
  uri = "/webhooks/app/uninstalled"
  topics = [ "app/uninstalled" ]

[build]
include_config_on_deploy = true
```

然后：

```bash
export SHOPIFY_CLI_PARTNERS_TOKEN=<atkn_...>
shopify app deploy --allow-updates --client-id=0dce9a73d4a5e8536ff17c7c446d5273
```

### 5. 安装到店铺并激活扩展

1. 店铺后台卸载再重装 ChinaPass（让它用上新版本 + 新 App URL）；
2. Settings → Checkout → Customize → **Apps** → 应能看到 **ChinaPass Checkout ID** → 拖入结算页 → Save；
3. 前台结算页选 **China** → 应看到身份证表单。

## 常见问题

- **冷启动慢**：Render 免费档闲置 15 分钟休眠，首次访问约 50 秒。
- **免费 Postgres 过期**：优先用 Neon（长期免费）。
- **容器启动报 `prisma migrate deploy` 失败**：确认 `DATABASE_URL` 带 `?sslmode=require`。
