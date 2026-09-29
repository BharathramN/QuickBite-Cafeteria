/**
 * Returns today's date in YYYY-MM-DD format based on local time
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if current time is past the daily booking cutoff time
 * @param {string} cutoffTime - e.g. "09:30" (24-hour format)
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isPastCutoff = (cutoffTime = '09:00', dateStr = getTodayDateString()) => {
  const today = getTodayDateString();
  
  // If target date is in the past, booking is closed
  if (dateStr < today) return true;
  // If target date is in the future, booking is open
  if (dateStr > today) return false;

  const now = new Date();
  const [cutoffHours, cutoffMinutes] = cutoffTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const cutoffTotalMinutes = cutoffHours * 60 + (cutoffMinutes || 0);

  return currentMinutes >= cutoffTotalMinutes;
};
