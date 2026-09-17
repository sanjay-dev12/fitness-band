/**
 * Formats a timestamp to clearly show both DAY and TIME of connection/telemetry.
 * Example outputs:
 *  - "Today (Wed, 17 Sep) at 11:02 AM"
 *  - "Wed, 17 Sep at 11:02 AM"
 */
export const formatConnectedDateTime = (date, short = false) => {
  if (!date) return 'Live Connected';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Live Connected';

  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayName = d.toLocaleDateString([], { weekday: 'short' });
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const isToday = d.toDateString() === new Date().toDateString();

  if (short) {
    return isToday ? `Today, ${timeStr}` : `${dayName}, ${dateStr} • ${timeStr}`;
  }

  return isToday
    ? `Today (${dayName}, ${dateStr}) at ${timeStr}`
    : `${dayName}, ${dateStr} at ${timeStr}`;
};
