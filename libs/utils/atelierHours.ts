type BusinessHours = { daysOfWeek?: string[]; opensAt?: string; closesAt?: string; timeZone?: string } | null | undefined;

function formatTime(value?: string) {
  if (!value) return '';
  const [hourText, minute = '00'] = value.split(':');
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function atelierHoursLabel(hours: BusinessHours) {
  if (!hours?.opensAt || !hours.closesAt) return 'Loading atelier hours…';
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const days = weekdays.every((day) => hours.daysOfWeek?.includes(day)) ? 'Mon–Fri' : (hours.daysOfWeek ?? []).map((day) => day.slice(0, 3)).join('–');
  return `${days} · ${formatTime(hours.opensAt)}–${formatTime(hours.closesAt)} ${hours.timeZone === 'Asia/Seoul' ? 'KST' : ''}`.trim();
}
