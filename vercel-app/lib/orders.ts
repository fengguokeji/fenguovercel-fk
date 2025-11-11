import { sql as vercelSql } from '@vercel/postgres';
import { Pool, type PoolConfig } from 'pg';
import { tutorialUrl, orderStatus, type OrderStatusKey } from './constants';

type SqlExecutor = <T = unknown>(
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<{ rows: T[] }>;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  null;

const connectionHost = (() => {
  if (!connectionString) return undefined;
  try {
    return new URL(connectionString).hostname;
  } catch {
    return undefined;
  }
})();

const isVercelPostgresHost = Boolean(connectionHost && connectionHost.endsWith('.vercel-storage.com'));
const shouldUsePgClient = Boolean(connectionString && !isVercelPostgresHost);

let pgPool: Pool | undefined;

const sql: SqlExecutor = shouldUsePgClient
  ? (async <T = unknown>(strings: TemplateStringsArray, ...values: any[]) => {
      if (!pgPool) {
        const config: PoolConfig = { connectionString: connectionString! };

        const sslMode = (() => {
          if (!connectionString) return undefined;
          try {
            const url = new URL(connectionString);
            const param = url.searchParams.get('sslmode');
            if (param && param !== 'disable') {
              return { rejectUnauthorized: false } as const;
            }
          } catch {
            // ignore parsing errors, fall back to heuristic checks below
          }
          if (connectionHost && /supabase\.co$|supabase\.com$/.test(connectionHost)) {
            return { rejectUnauthorized: false } as const;
          }
          return process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } as const : undefined;
        })();

        if (sslMode) {
          config.ssl = sslMode;
        }

        pgPool = global.__ORDER_PG_POOL__ ?? new Pool(config);
        if (!global.__ORDER_PG_POOL__) {
          global.__ORDER_PG_POOL__ = pgPool;
        }
      }

      const text = strings.reduce((acc, current, index) => {
        const placeholder = index < values.length ? `$${index + 1}` : '';
        return acc + current + placeholder;
      }, '');

      const result = await pgPool.query(text, values);
      return { rows: result.rows as T[] };
    })
  : (vercelSql as SqlExecutor);

const useMemoryStore =
  !process.env.POSTGRES_URL &&
  !process.env.POSTGRES_PRISMA_URL &&
  !process.env.POSTGRES_HOST &&
  !process.env.POSTGRES_USER;

type MemoryStore = Map<string, OrderRow>;

declare global {
  // eslint-disable-next-line no-var
  var __ORDER_STORE__: MemoryStore | undefined;
  var __ORDER_PG_POOL__: Pool | undefined;
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

export interface DatabaseStatus {
  ok: boolean;
  mode: 'memory' | 'postgres';
  message: string;
  error?: string;
}

export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  if (useMemoryStore) {
    return {
      ok: true,
      mode: 'memory',
      message: '当前未配置数据库连接，应用正在使用内存存储。'
    };
  }

  try {
    await ensureOrdersTable();
    await sql`SELECT 1`;
    return {
      ok: true,
      mode: 'postgres',
      message: '已成功连接到 Postgres，并确保 orders 表已创建。'
    };
  } catch (error) {
    return {
      ok: false,
      mode: 'postgres',
      message: '无法连接到 Postgres 数据库，请检查连接字符串配置。',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
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
