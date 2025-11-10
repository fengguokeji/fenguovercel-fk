# vercel-app Project Snapshot

## Directory Structure

vercel-app/
  .env.example
  .eslintrc.json
  .gitignore
  README.md
  next-env.d.ts
  next.config.js
  package.json
  tsconfig.json
  app/
    globals.css
    layout.tsx
    page.tsx
    api/
      alipay/
        notify/
          route.ts
      orders/
        route.ts
    orders/
      page.tsx
  lib/
    alipay.ts
    constants.ts
    orders.ts
    plans.ts

## File Contents

### .env.example

```
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\n..."
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\\n..."
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_NOTIFY_URL=https://your-domain.com/api/alipay/notify
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
TUTORIAL_URL=https://example.com/tutorial
```

### .eslintrc.json

```
{
  "root": true,
  "extends": ["next", "next/core-web-vitals"],
  "rules": {
    "array-bracket-spacing": "off",
    "arrow-parens": "off",
    "comma-dangle": "off",
    "newline-per-chained-call": "off",
    "@next/next/no-img-element": "off"
  }
}
```

### .gitignore

```
# dependencies
/node_modules

# production
/.next
/out

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### README.md

```markdown
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

   Next.js API 首次调用时会自动创建 `orders` 表。若要提前创建，可执行任意需要数据库的 API（例如在本地运行开发服务器并提交测试订单）。

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
```

### next-env.d.ts

```
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

### next.config.js

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig;
```

### package.json

```
{
  "name": "vercel-subscription-site",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@vercel/postgres": "^0.10.0",
    "alipay-sdk": "^4.14.0",
    "next": "14.2.4",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "20.12.7",
    "@types/react": "18.2.66",
    "@types/react-dom": "18.2.22",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.4",
    "typescript": "5.4.5"
  }
}
```

### tsconfig.json

```
{
  "compilerOptions": {
    "target": "es2022",
    "lib": [
      "dom",
      "dom.iterable",
      "es2022"
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/lib/*": [
        "lib/*"
      ],
      "@/components/*": [
        "components/*"
      ]
    },
    "types": [
      "node"
    ],
    "noEmit": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.cjs",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### app/globals.css

```
:root {
  color-scheme: light dark;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at top, #f1f5f9 0%, #e2e8f0 100%);
}

a {
  color: inherit;
}

button {
  cursor: pointer;
}

.container {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 1.5rem;
  box-shadow: 0 30px 50px rgba(15, 23, 42, 0.08);
  padding: 2rem;
  backdrop-filter: blur(16px);
}

.primary-button {
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 9999px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.35);
}

.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #cbd5f5;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid-three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  padding: 0.35rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 15px 25px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 0.75rem;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.qr-image {
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: white;
  padding: 1rem;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
}

.notice {
  background: rgba(59, 130, 246, 0.08);
  border-left: 4px solid #3b82f6;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  color: #1e3a8a;
  font-size: 0.95rem;
}
```

### app/layout.tsx

```
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '订阅服务购买中心',
  description: '支持支付宝支付、二维码交付和邮箱订单历史查询的订阅服务网站'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
```

### app/page.tsx

```
'use client';

import { useMemo, useState } from 'react';
import type { Plan } from '@/lib/plans';
import { plans } from '@/lib/plans';

interface CreateOrderResponse {
  orderId: string;
  qrCode: string;
  tutorialUrl: string;
  amount: number;
  status: string;
  simulated: boolean;
}

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);

  const total = useMemo(() => selectedPlan.price * quantity, [selectedPlan, quantity]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id, quantity, email })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? '下单失败，请稍后再试');
      }

      const payload = (await response.json()) as CreateOrderResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '下单失败，请稍后再试');
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '2.5rem' }}>
      <header className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="badge" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <span role="img" aria-label="lightning">⚡️</span>
          极速交付 · 支持支付宝
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem', lineHeight: 1.15 }}>
          解锁您的专属订阅服务
        </h1>
        <p style={{ maxWidth: '560px', margin: '0 auto', color: '#475569', fontSize: '1.05rem' }}>
          选择合适的套餐，使用支付宝扫码支付，支付完成后立即展示访问所需的二维码，并附上详细的使用教程。
        </p>
      </header>

      <section className="grid grid-three">
        {plans.map((plan) => (
          <button
            key={plan.id}
            className="card"
            style={{
              border: plan.id === selectedPlan.id ? '2px solid #6366f1' : '2px solid transparent',
              textAlign: 'left',
              transition: 'border 0.2s ease, transform 0.2s ease',
              transform: plan.id === selectedPlan.id ? 'translateY(-6px)' : 'translateY(0)',
              cursor: 'pointer'
            }}
            type="button"
            onClick={() => setSelectedPlan(plan)}
          >
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem' }}>{plan.name}</h2>
            <p style={{ margin: '0 0 1rem', color: '#475569', minHeight: '3rem' }}>{plan.description}</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1d4ed8' }}>¥{plan.price.toFixed(2)}</div>
            <ul style={{ padding: 0, marginTop: '1.25rem', listStyle: 'none', display: 'grid', gap: '0.75rem' }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                  <span role="img" aria-label="check">✅</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </section>

      <section className="card" style={{ display: 'grid', gap: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>填写信息并下单</h2>
        <form className="grid" style={{ gap: '1.25rem' }} onSubmit={submit}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>联系邮箱</span>
            <input
              className="input"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span>购买数量</span>
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>

          <div className="notice">
            支付完成后页面会立即显示兑换二维码与使用教程链接，同时系统会自动将订单发送至您填写的邮箱，方便后续在
            <a href="/orders" style={{ color: '#1d4ed8', fontWeight: 600 }}> 订单中心 </a>
            查看历史记录。
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '创建订单中...' : `使用支付宝支付 ¥${total.toFixed(2)}`}
          </button>
        </form>

        {error && (
          <div className="notice" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', borderColor: '#ef4444' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="grid" style={{ gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>订单已创建</h3>
            <p style={{ margin: 0, color: '#334155' }}>
              订单号：{result.orderId} · 合计：¥{result.amount.toFixed(2)}
              {result.simulated && '（使用沙箱/模拟模式）'}
            </p>
            <div className="qr-wrapper">
              <img className="qr-image" src={result.qrCode} alt="支付宝支付二维码" width={220} height={220} />
            </div>
            <a className="primary-button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} href={result.tutorialUrl} target="_blank" rel="noreferrer">
              查看使用教程
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
```

### app/orders/page.tsx

```
'use client';

import { useState } from 'react';

interface OrderRecord {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  quantity: number;
  status: string;
  paymentQrCode?: string;
  tutorialUrl: string;
  createdAt: string;
  simulated: boolean;
}

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? '查询失败');
      }

      const payload = (await response.json()) as { orders: OrderRecord[] };
      setOrders(payload.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h1 style={{ margin: 0 }}>订单中心</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>
          输入下单时使用的邮箱，即可查看历史订单与支付状态。如果订单仍为待支付状态，可直接使用原二维码完成付款。
        </p>
      </header>

      <form className="grid" style={{ gap: '1rem', alignItems: 'flex-end' }} onSubmit={loadOrders}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span>邮箱</span>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? '查询中...' : '查看订单'}
        </button>
      </form>

      {error && (
        <div className="notice" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', borderColor: '#ef4444' }}>
          {error}
        </div>
      )}

      <ul className="order-list" style={{ display: 'grid', gap: '1rem' }}>
        {orders.map((order) => (
          <li key={order.id} className="order-item">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between' }}>
              <strong>{order.planName}</strong>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>
                订单号：{order.id}
                {order.simulated && '（模拟）'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#475569' }}>
              <span>数量：{order.quantity}</span>
              <span>金额：¥{order.amount.toFixed(2)}</span>
              <span>状态：{order.status}</span>
              <span>下单时间：{new Date(order.createdAt).toLocaleString()}</span>
            </div>

            {order.paymentQrCode && (
              <details>
                <summary style={{ cursor: 'pointer', color: '#1d4ed8', fontWeight: 600 }}>查看支付二维码</summary>
                <div className="qr-wrapper">
                  <img className="qr-image" src={order.paymentQrCode} alt="支付二维码" width={200} height={200} />
                </div>
              </details>
            )}

            <a className="primary-button" style={{ width: 'fit-content' }} href={order.tutorialUrl} target="_blank" rel="noreferrer">
              查看使用教程
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### app/api/alipay/notify/route.ts

```
import { NextRequest, NextResponse } from 'next/server';
import { verifyAlipayNotify } from '@/lib/alipay';
import { markOrderFailed, markOrderPaid } from '@/lib/orders';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = Object.fromEntries(formData.entries()) as Record<string, string>;

  const isValid = verifyAlipayNotify(params);
  if (!isValid) {
    return NextResponse.json({ message: 'invalid sign' }, { status: 400 });
  }

  const tradeStatus = params.trade_status;
  const outTradeNo = params.out_trade_no;
  const tradeNo = params.trade_no ?? '';

  if (!outTradeNo || !tradeStatus) {
    return NextResponse.json({ message: 'missing params' }, { status: 400 });
  }

  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    await markOrderPaid(outTradeNo, tradeNo);
  } else if (tradeStatus === 'TRADE_CLOSED') {
    await markOrderFailed(outTradeNo);
  }

  return new NextResponse('success');
}
```

### app/api/orders/route.ts

```
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlan } from '@/lib/plans';
import { tutorialUrl, orderStatus } from '@/lib/constants';
import { createPreOrder } from '@/lib/alipay';
import { createOrder, listOrdersByEmail } from '@/lib/orders';

const createSchema = z.object({
  email: z.string().email(),
  planId: z.string(),
  quantity: z.number().int().min(1).max(10)
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch (error) {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: '参数错误',
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { email, planId, quantity } = parsed.data;
  const plan = getPlan(planId);

  if (!plan) {
    return NextResponse.json({ error: '未找到对应的套餐' }, { status: 404 });
  }

  const orderId = crypto.randomUUID();
  const amount = plan.price * quantity;

  try {
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL;
    const preOrder = await createPreOrder({
      orderId,
      subject: `${plan.name} x${quantity}`,
      amount,
      notifyUrl
    });

    await createOrder({
      id: orderId,
      email,
      planId: plan.id,
      planName: plan.name,
      amount,
      quantity,
      paymentQrCode: preOrder.qrCode,
      simulated: preOrder.simulated
    });

    return NextResponse.json({
      orderId,
      qrCode: preOrder.qrCode,
      tutorialUrl,
      amount,
      status: orderStatus.pending,
      simulated: preOrder.simulated
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '下单失败' }, { status: 500 });
  }
}

const emailSchema = z.object({ email: z.string().email() });

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = emailSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: '请输入正确的邮箱地址' }, { status: 400 });
  }

  const orders = await listOrdersByEmail(parsed.data.email);
  return NextResponse.json({ orders });
}
```

### lib/alipay.ts

```
import crypto from 'node:crypto';
import { AlipaySdk, AlipaySdkConfig } from 'alipay-sdk';

interface CreatePreOrderOptions {
  orderId: string;
  subject: string;
  amount: number;
  notifyUrl?: string;
}

export interface PreOrderResult {
  tradeNo: string;
  qrCode: string;
  rawResponse: unknown;
  simulated: boolean;
}

let sdkInstance: AlipaySdk | null = null;

function buildSdk(): AlipaySdk | null {
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const publicKey = process.env.ALIPAY_PUBLIC_KEY;

  if (!appId || !privateKey || !publicKey) {
    return null;
  }

  const config: AlipaySdkConfig = {
    appId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    alipayPublicKey: publicKey.replace(/\\n/g, '\n'),
    gateway: process.env.ALIPAY_GATEWAY ?? 'https://openapi.alipay.com/gateway.do',
    signType: 'RSA2'
  };

  return new AlipaySdk(config);
}

function getSdk(): AlipaySdk | null {
  if (!sdkInstance) {
    sdkInstance = buildSdk();
  }
  return sdkInstance;
}

export async function createPreOrder({ orderId, subject, amount, notifyUrl }: CreatePreOrderOptions): Promise<PreOrderResult> {
  const sdk = getSdk();
  const totalAmount = amount.toFixed(2);

  if (!sdk) {
    const qrPayload = `支付宝沙箱二维码：订单 ${orderId} 金额 ${totalAmount}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}`;
    return {
      tradeNo: crypto.randomUUID(),
      qrCode: qrCodeUrl,
      rawResponse: { message: 'Alipay credentials missing, returning mocked QR code.' },
      simulated: true
    };
  }

  const response = await sdk.exec('alipay.trade.precreate', {
    notifyUrl,
    bizContent: {
      out_trade_no: orderId,
      subject,
      total_amount: totalAmount,
      timeout_express: '30m'
    }
  });

  const qrCode = response?.qr_code ?? '';
  const tradeNo = response?.trade_no ?? '';

  if (!qrCode) {
    throw new Error('未能从支付宝获取二维码，请检查配置。');
  }

  return {
    tradeNo,
    qrCode,
    rawResponse: response,
    simulated: false
  };
}

export function verifyAlipayNotify(params: Record<string, string>): boolean {
  const sdk = getSdk();
  if (!sdk) {
    return true;
  }

  return sdk.checkNotifySign(params);
}
```

### lib/constants.ts

```
export const tutorialUrl = process.env.TUTORIAL_URL ?? 'https://example.com/tutorial';

export const orderStatus = {
  pending: '待支付',
  paid: '已支付',
  failed: '支付失败'
} as const;

export type OrderStatusKey = keyof typeof orderStatus;
```

### lib/orders.ts

```
import { sql } from '@vercel/postgres';
import { tutorialUrl, orderStatus, type OrderStatusKey } from './constants';

const useMemoryStore =
  !process.env.POSTGRES_URL &&
  !process.env.POSTGRES_PRISMA_URL &&
  !process.env.POSTGRES_HOST &&
  !process.env.POSTGRES_USER;

type MemoryStore = Map<string, OrderRow>;

declare global {
  // eslint-disable-next-line no-var
  var __ORDER_STORE__: MemoryStore | undefined;
}

function getMemoryStore(): MemoryStore {
  if (!global.__ORDER_STORE__) {
    global.__ORDER_STORE__ = new Map();
  }
  return global.__ORDER_STORE__;
}

interface DbOrderRow {
  id: string;
  email: string;
  plan_id: string;
  plan_name: string;
  amount: string;
  quantity: number;
  status: string;
  payment_qr_code: string | null;
  alipay_trade_no: string | null;
  simulated: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface OrderRow {
  id: string;
  email: string;
  planId: string;
  planName: string;
  amount: number;
  quantity: number;
  status: OrderStatusKey;
  paymentQrCode: string | null;
  alipayTradeNo: string | null;
  simulated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function normalizeStatus(value: string): OrderStatusKey {
  if (value === 'paid' || value === 'failed') {
    return value;
  }
  return 'pending';
}

const ensurePromise = (async () => {
  if (useMemoryStore) return;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL,
      payment_qr_code TEXT,
      alipay_trade_no TEXT,
      simulated BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
})();

export async function ensureOrdersTable(): Promise<void> {
  await ensurePromise;
}

export interface CreateOrderInput {
  id: string;
  email: string;
  planId: string;
  planName: string;
  amount: number;
  quantity: number;
  paymentQrCode: string;
  simulated: boolean;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  await ensureOrdersTable();
  const now = new Date();

  if (useMemoryStore) {
    const order: OrderRow = {
      id: input.id,
      email: input.email,
      planId: input.planId,
      planName: input.planName,
      amount: input.amount,
      quantity: input.quantity,
      status: 'pending',
      paymentQrCode: input.paymentQrCode,
      alipayTradeNo: null,
      simulated: input.simulated,
      createdAt: now,
      updatedAt: now
    };
    getMemoryStore().set(order.id, order);
    return order;
  }

  const result = await sql<DbOrderRow>`
    INSERT INTO orders (id, email, plan_id, plan_name, amount, quantity, status, payment_qr_code, simulated)
    VALUES (${input.id}, ${input.email}, ${input.planId}, ${input.planName}, ${input.amount}, ${input.quantity}, ${'pending'}, ${input.paymentQrCode}, ${input.simulated})
    RETURNING *
  `;

  return mapDbRow(result.rows[0]);
}

export async function markOrderPaid(id: string, alipayTradeNo: string): Promise<OrderRow | null> {
  await ensureOrdersTable();
  const now = new Date();

  if (useMemoryStore) {
    const store = getMemoryStore();
    const existing = store.get(id);
    if (!existing) return null;
    const updated: OrderRow = { ...existing, status: 'paid', alipayTradeNo, updatedAt: now };
    store.set(id, updated);
    return updated;
  }

  const result = await sql<DbOrderRow>`
    UPDATE orders
    SET status = ${'paid'}, alipay_trade_no = ${alipayTradeNo}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] ? mapDbRow(result.rows[0]) : null;
}

export async function markOrderFailed(id: string): Promise<OrderRow | null> {
  await ensureOrdersTable();
  const now = new Date();

  if (useMemoryStore) {
    const store = getMemoryStore();
    const existing = store.get(id);
    if (!existing) return null;
    const updated: OrderRow = { ...existing, status: 'failed', updatedAt: now };
    store.set(id, updated);
    return updated;
  }

  const result = await sql<DbOrderRow>`
    UPDATE orders
    SET status = ${'failed'}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] ? mapDbRow(result.rows[0]) : null;
}

export async function listOrdersByEmail(email: string): Promise<ReturnOrder[]> {
  await ensureOrdersTable();

  if (useMemoryStore) {
    const store = getMemoryStore();
    return Array.from(store.values())
      .filter((order) => order.email === email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toReturnOrder);
  }

  const result = await sql<DbOrderRow>`
    SELECT * FROM orders
    WHERE email = ${email}
    ORDER BY created_at DESC
  `;

  return result.rows.map((row) => toReturnOrder(mapDbRow(row)));
}

export interface ReturnOrder {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  quantity: number;
  status: string;
  paymentQrCode: string | null;
  tutorialUrl: string;
  createdAt: string;
  simulated: boolean;
}

function mapDbRow(row: DbOrderRow): OrderRow {
  return {
    id: row.id,
    email: row.email,
    planId: row.plan_id,
    planName: row.plan_name,
    amount: Number(row.amount),
    quantity: row.quantity,
    status: normalizeStatus(row.status),
    paymentQrCode: row.payment_qr_code,
    alipayTradeNo: row.alipay_trade_no,
    simulated: row.simulated,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function toReturnOrder(row: OrderRow): ReturnOrder {
  return {
    id: row.id,
    planId: row.planId,
    planName: row.planName,
    amount: row.amount,
    quantity: row.quantity,
    status: orderStatus[row.status] ?? row.status,
    paymentQrCode: row.paymentQrCode,
    tutorialUrl,
    createdAt: row.createdAt.toISOString(),
    simulated: row.simulated
  };
}
```

### lib/plans.ts

```
export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: '入门版',
    price: 29,
    description: '适合个人体验核心功能，立即获取服务二维码。',
    features: ['单设备授权', '24 小时内客服响应', '基础使用教程']
  },
  {
    id: 'professional',
    name: '专业版',
    price: 79,
    description: '面向重度用户，包含高级功能和优先支持。',
    features: ['三设备授权', '优先客服通道', '进阶功能视频教程']
  },
  {
    id: 'enterprise',
    name: '团队版',
    price: 199,
    description: '团队协作套餐，含批量账号与专属顾问服务。',
    features: ['十设备授权', '专属客户成功顾问', '团队入门培训资料包']
  }
];

export function getPlan(planId: string): Plan | undefined {
  return plans.find((plan) => plan.id === planId);
}
```
