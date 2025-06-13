export function formatDate(timestamp, offset = 0) {
  const date = new Date(timestamp + offset * 60 * 1000);
  const DD = date.getUTCDate().toString().padStart(2, '0');
  const MM = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const YYYY = date.getUTCFullYear();
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');

  return `${DD}.${MM}.${YYYY} ${hh}:${mm}`;
}

export function formatDuration(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}
