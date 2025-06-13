export const MAX_TRANSFER_HOURS = 72;

export function clampMinTransferHours(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(Math.max(num, 0), MAX_TRANSFER_HOURS);
}

export function parseMinTransferHours(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < 0 || num > MAX_TRANSFER_HOURS) return null;
  return num;
}
