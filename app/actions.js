'use server';

import { pathFinder } from '../lib/susanin';

export async function findRoutes(formData) {
  const from = formData.get('from');
  const to = formData.get('to');
  const date = formData.get('date');
  const min = Number(formData.get('minTransferTime') ?? 3) * 3600;

  return pathFinder(from, to, date, min);
}
