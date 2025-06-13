'use server';

import { pathFinder } from '../lib/susanin';
import { parseMinTransferHours } from '../lib/config.js';

export async function findRoutes(formData) {
  const from = formData.get('from');
  const to = formData.get('to');
  const date = formData.get('date');
  const raw = formData.get('minTransferTime') ?? '3';
  const minHours = parseMinTransferHours(raw);
  if (minHours === null) {
    throw new Error('Invalid minTransferTime');
  }
  const min = minHours * 3600;

  return pathFinder(from, to, date, min);
}
