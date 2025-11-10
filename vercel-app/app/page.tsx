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
