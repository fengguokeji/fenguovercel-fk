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
