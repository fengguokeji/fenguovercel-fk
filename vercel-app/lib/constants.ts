export const tutorialUrl = process.env.TUTORIAL_URL ?? 'https://example.com/tutorial';

export const orderStatus = {
  pending: '待支付',
  paid: '已支付',
  failed: '支付失败'
} as const;

export type OrderStatusKey = keyof typeof orderStatus;
