import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/orders';

export async function GET() {
  const result = await checkDatabaseConnection();
  const status = result.ok ? 200 : 500;
  return NextResponse.json(result, { status });
}
