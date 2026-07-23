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

// Uses the local calendar getters (not toISOString, which is UTC) so the
// default date matches what the user considers "today" in their own
// timezone, not UTC's -- those disagree for part of every day everywhere
// except UTC+0.
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
