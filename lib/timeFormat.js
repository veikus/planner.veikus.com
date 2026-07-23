export function formatDuration(ms) {
  const clampedMs = Math.max(0, ms);
  const days = Math.floor(clampedMs / 86400000);
  const hours = Math.floor((clampedMs % 86400000) / 3600000);
  const minutes = Math.floor((clampedMs % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}
