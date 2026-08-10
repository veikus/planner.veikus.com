import { NextResponse } from 'next/server';
import { pathFinder } from '@/lib/susanin';
import { airportExists } from '@/lib/db.js';
import { parseMinTransferHours } from '@/lib/config.js';
import { isValidDate, isWithinScheduleRange } from '@/lib/dateRange.js';

export async function GET(request, { params }) {
  const { from, to, date } = await params;
  const { searchParams } = new URL(request.url);

  if (!isValidDate(date) || !(await isWithinScheduleRange(date))) {
    return NextResponse.json({ error: 'invalid date' }, { status: 400 });
  }

  if (!(await airportExists(from)) || !(await airportExists(to))) {
    return NextResponse.json({ error: 'unknown airport' }, { status: 404 });
  }

  const minTransferTime = parseMinTransferHours(searchParams.get('minTransferTime') ?? '3');
  if (minTransferTime === null) {
    return NextResponse.json({ error: 'invalid minTransferTime' }, { status: 400 });
  }

  const routes = await pathFinder(from, to, date, minTransferTime);
  return NextResponse.json({ from, to, date, minTransferTime, routes });
}
