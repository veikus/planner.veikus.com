export function formatDuration(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

// Local timestamps come formatted as 'dd.MM.yyyy HH:mm' (see lib/susanin.js).
export function localTime(localDateTime) {
  return localDateTime.split(' ')[1];
}

// Difference, in whole calendar days, between two 'dd.MM.yyyy HH:mm' local timestamps.
export function localDayDiff(fromLocalDateTime, toLocalDateTime) {
  const toUTCMidnight = (localDateTime) => {
    const [day, month, year] = localDateTime.split(' ')[0].split('.').map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round(
    (toUTCMidnight(toLocalDateTime) - toUTCMidnight(fromLocalDateTime)) / 86400000
  );
}
