# 订阅服务购买网站

该目录包含一个基于 Next.js 的订阅购买网站示例，可直接部署到 Vercel，并集成支付宝支付、二维码交付与邮箱订单查询能力。网站内部使用本仓库提供的 `alipay-sdk` 来创建支付宝预订单。

## 功能亮点

- 📦 三档套餐配置，可自定义价格、权益等文案。
- 💰 通过 `alipay.trade.precreate` 创建预订单，并在页面展示扫码支付二维码。
- ✅ 支持支付宝异步通知，支付成功后自动更新订单状态。
- 🔁 使用邮箱即可查询历史订单，并重新获取支付二维码与使用教程链接。
- ☁️ 默认对接 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 存储，确保订单在无状态函数环境下持久化。
- 🧪 若未配置支付宝密钥，自动退化为沙箱/模拟模式，便于开发调试。
- 💾 在本地开发且未配置数据库连接时，自动使用内存存储，避免阻塞流程。

## 快速开始

1. **安装依赖**

   ```bash
   cd vercel-app
   npm install
   ```

2. **配置环境变量**

   复制 `.env.example` 为 `.env.local` 并填入以下内容：

   - `ALIPAY_APP_ID`、`ALIPAY_PRIVATE_KEY`、`ALIPAY_PUBLIC_KEY`：来自支付宝开放平台的应用信息，密钥需使用 RSA2。
   - `ALIPAY_GATEWAY`：默认正式环境，如需沙箱可改为 `https://openapi.alipaydev.com/gateway.do`。
   - `ALIPAY_NOTIFY_URL`：支付宝异步通知地址（需在支付宝开放平台控制台配置）。
   - `POSTGRES_URL` 等：Vercel Postgres 提供的一组连接字符串。
   - `TUTORIAL_URL`：支付完成后展示的使用教程链接。

3. **初始化数据库**

   Next.js API 首次调用时会自动创建 `orders` 表并写入订单数据，因此无需手动预置订单号、邮箱或支付信息。
   若要提前验证数据库连接，可执行任意需要数据库的 API（例如在本地运行开发服务器并提交测试订单）。

   ```bash
   # 在本地直接创建一笔测试订单（会自动生成订单号、二维码等信息）
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "email": "tester@example.com",
       "planId": "basic",
       "quantity": 1
     }'
   ```

   成功后可以通过 `/api/orders?email=tester@example.com` 或前端的“订单中心”页面查看数据库中的订单记录。

   若需要确认数据库是否已正确连接并可用，可访问新增的健康检查接口：

   ```bash
   curl http://localhost:3000/api/health/database
   ```

   - 当返回 `{ "ok": true, "mode": "postgres" }` 时表示已成功连通 Postgres。
   - 若当前使用内存存储，会返回 `{ "ok": true, "mode": "memory" }`，提示未配置数据库连接字符串。
   - 当 `ok` 为 `false` 时，会包含错误信息，便于排查连接问题。

4. **本地开发**

   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 即可体验页面。

5. **部署到 Vercel**

   - 在 Vercel 新建项目并选择本仓库。
   - 将项目的 `Root Directory` 指定为 `vercel-app`，或保留默认设置并使用仓库根目录的 `vercel.json`（见下文）。
   - 在 Vercel 项目设置中配置上文提到的环境变量。
   - 选择 Vercel Postgres 并将连接信息写入环境变量。

## 支付宝异步通知

支付宝会以 `application/x-www-form-urlencoded` 的形式调用 `/api/alipay/notify`。本项目会使用 SDK 自动验签，并根据 `trade_status` 更新订单状态。

部署后，请确保：

- `ALIPAY_NOTIFY_URL` 指向线上站点的通知地址，例如 `https://your-domain.vercel.app/api/alipay/notify`。
- 在支付宝开放平台控制台中将该地址填入“异步通知”配置。

## 模拟模式

若未提供支付宝密钥，`createPreOrder` 会返回一个基于第三方二维码服务生成的测试二维码。此模式适用于开发和展示，但不会触发真实支付。

## 自定义

- 如需调整套餐、价格或权益，可直接修改 `lib/plans.ts`。
- 默认使用 `@vercel/postgres` 存储订单，若希望接入其他数据库，可替换 `lib/orders.ts` 中的实现。
- 样式采用少量手写 CSS，适合根据品牌需求进一步定制。

## 目录结构

```
vercel-app/
├─ app/                # Next.js App Router 页面 & API 路由
├─ components/         # 复用组件（当前示例未拆分）
├─ lib/                # 套餐配置、支付宝封装、数据库读写
├─ public/             # 静态资源占位目录
├─ package.json        # 前端应用依赖
└─ README.md           # 本说明文档
```
