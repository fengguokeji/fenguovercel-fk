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
