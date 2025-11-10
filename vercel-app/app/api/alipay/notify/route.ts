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
