/**
 * Format a date for display (e.g., "Mon, Jan 27")
 */
export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Convert PST time to user's local time
 */
export const convertPSTToLocal = (pstHour: number, minute: number = 0): string => {
  // PST is UTC-8
  const pstOffset = 480; // PST offset in minutes (8 * 60)
  const userOffset = new Date().getTimezoneOffset();
  const diffInMinutes = pstOffset - userOffset;

  const date = new Date();
  date.setHours(pstHour, minute, 0, 0);
  date.setMinutes(date.getMinutes() + diffInMinutes);

  const localHour = date.getHours();
  const localMinute = date.getMinutes();

  return `${localHour.toString().padStart(2, '0')}:${localMinute.toString().padStart(2, '0')}`;
};

/**
 * Extract time portion from ISO datetime string (e.g., '2026-01-28T10:30:00Z' -> '10:30')
 */
export const extractTimeFromISO = (isoDatetime: string): string => {
  const date = new Date(isoDatetime);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
