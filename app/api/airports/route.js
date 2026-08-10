import { NextResponse } from 'next/server';
import { getAirports } from '@/lib/db.js';

export async function GET() {
  const airports = await getAirports();
  return NextResponse.json(airports);
}
