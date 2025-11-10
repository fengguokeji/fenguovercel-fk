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
