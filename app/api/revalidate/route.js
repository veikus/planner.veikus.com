import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Called by planner-data's generate-schedule.mjs right after a successful
// DB swap, so the site drops its ISR cache immediately instead of waiting
// out the 24h `revalidate` window on the affected pages.
export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'invalid secret' }, { status: 401 });
  }

  revalidatePath('/');
  revalidatePath('/[from]/[to]/[date]', 'page');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
