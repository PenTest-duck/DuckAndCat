/**
 * Adjusts a date by subtracting 5 hours
 * @param date The date to adjust
 * @returns The adjusted date
 */
export function adjustDate(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(d.getHours() - 5);
  return d;
}

/**
 * Formats a date to a string with the time adjusted by -5 hours
 * @param date The date to format
 * @param format The format to use (default: 'en-US')
 * @returns The formatted date string
 */
export function formatAdjustedDate(
  date: Date | string,
  format: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const adjustedDate = adjustDate(date);
  return adjustedDate.toLocaleString('en-US', format);
} 