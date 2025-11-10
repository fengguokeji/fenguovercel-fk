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
