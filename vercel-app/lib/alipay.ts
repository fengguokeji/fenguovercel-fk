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
