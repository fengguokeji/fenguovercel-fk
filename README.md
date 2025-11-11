# 订阅购买站点与 Alipay SDK 一体化示例

本仓库同时包含：

- `alipay-sdk`：支付宝开放平台的 Node.js SDK，提供签名、验签与接口访问能力；
- `vercel-app/`：基于 Next.js 打造的订阅购买示例站点，可直接部署到 Vercel，并与支付宝支付和 Vercel Postgres 集成。

如果你希望快速部署一个可扫码支付、自动同步订单状态的演示站点，只需 Fork 或直接在 Vercel 中导入本仓库，并按照下文步骤完成配置即可。

## 仓库结构

```
├─ src/                 # SDK 源码
├─ vercel-app/          # Next.js 示例站点（默认部署目标）
├─ vercel.json          # Vercel 部署配置，自动在子目录安装/构建
└─ README.md            # 当前说明文档
```

## 环境要求

- Node.js ≥ 18.20.0
- npm ≥ 9（或任意兼容的包管理器）

## 快速本地体验

1. 安装依赖并构建 SDK（可选，用于在本地调试 SDK）：
   ```bash
   npm install
   ```

2. 安装示例站点依赖并启动本地开发服务器：
   ```bash
   cd vercel-app
   npm install
   npm run dev
   ```

3. 访问 [http://localhost:3000](http://localhost:3000) 体验站点。首次提交订单时会自动创建 `orders` 表；若未配置数据库连接，则会退化为内存存储模式。

## 环境变量说明

在 `vercel-app/.env.example` 中列出了部署所需的全部变量，可复制为 `.env.local` 后填入真实值：

- `ALIPAY_APP_ID`、`ALIPAY_PRIVATE_KEY`、`ALIPAY_PUBLIC_KEY`：来自支付宝开放平台控制台的应用信息，密钥需使用 RSA2。
- `ALIPAY_GATEWAY`：网关地址，默认正式环境；如需沙箱可改为 `https://openapi.alipaydev.com/gateway.do`。
- `ALIPAY_NOTIFY_URL`：支付宝异步通知回调地址，需与开放平台的配置保持一致。
- `POSTGRES_URL`、`POSTGRES_URL_NON_POOLING`、`POSTGRES_PRISMA_URL`：Vercel Postgres 提供的一组连接字符串，可在项目的 **Storage → Postgres** 页面复制。
- `POSTGRES_SSL`：若你的 Postgres 需要跳过证书校验，保留为 `true` 即可。
- `TUTORIAL_URL`：支付成功后展示的使用教程链接。

## 部署到 Vercel 的完整步骤

1. **在 Vercel 中导入仓库**
   - 登录 [Vercel 控制台](https://vercel.com/dashboard)，点击 **Add New… → Project**。
   - 选择你 Fork 后或原始的 Git 仓库，Vercel 会自动识别根目录下的 `vercel.json` 并锁定 `vercel-app` 作为构建目录，无需手动调整 Root Directory。

2. **创建 Vercel Postgres 数据库**
   - 在导入流程中，点击 **Continue to Deploy** 前，选择 **Storage → Add → Postgres**。
   - 为数据库命名后创建，Vercel 会自动将 `POSTGRES_URL` 等环境变量添加到项目中。

3. **配置支付宝相关环境变量**
   - 在项目的 **Settings → Environment Variables** 中新增以下变量：
     - `ALIPAY_APP_ID`
     - `ALIPAY_PRIVATE_KEY`
     - `ALIPAY_PUBLIC_KEY`
     - （可选）`ALIPAY_GATEWAY`、`ALIPAY_NOTIFY_URL`、`TUTORIAL_URL`
   - 若需要在不同环境（Production / Preview / Development）使用不同值，可分别设置。

4. **触发部署**
   - 点击 **Deploy**，Vercel 将执行 `cd vercel-app && npm install` 与 `npm run build` 并生成产物。
   - 构建完成后即可访问站点，并自动创建 `orders` 表。

5. **验证数据库连通性**
   - 部署成功后，可在浏览器访问 `https://你的域名/api/health/database` 查看状态：
     - `{ "ok": true, "mode": "postgres" }` 表示已成功连接数据库；
     - `{ "ok": true, "mode": "memory" }` 表示缺少数据库配置；
     - `ok` 为 `false` 时会附带错误信息，便于排查。

6. **配置支付宝异步通知**
   - 在支付宝开放平台中，将 `ALIPAY_NOTIFY_URL` 对应的地址（例如 `https://your-domain.vercel.app/api/alipay/notify`）填入“异步通知”设置。
   - 确认防火墙或安全组允许支付宝服务器访问该地址。

## 常见问题

- **为什么我还能提交订单但数据库没有记录？**
  - 若未配置 Postgres 环境变量，应用会自动退化为内存存储模式，仅在当前无状态实例内保存数据。请参考上文步骤创建并绑定 Vercel Postgres。

- **部署失败并提示缺少依赖？**
  - 请确认 Vercel 项目使用的是默认的 `vercel.json`，其中已经声明了在 `vercel-app` 子目录内安装依赖与构建。如果你自定义了构建命令，请确保也切换到该目录再执行。

- **如何更新站点或 SDK？**
  - 推送代码到主分支即可触发新一轮部署。若需要仅更新 SDK 而不影响站点，可在独立分支开发并合并后再发布。

## 许可协议

本项目与 SDK 均使用 MIT License，详见 [LICENSE.txt](./LICENSE.txt)。
