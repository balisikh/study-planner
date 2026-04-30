export function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function startOfWeekISO(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  const w = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - w);
  return d.toISOString().slice(0, 10);
}

export function formatDisplayDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  // Fully deterministic formatting (no Intl / locale) to avoid hydration mismatches
  // between Node (server) and the browser (client).
  const d = new Date(Date.UTC(y, m - 1, day));
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;
  const wd = weekdays[d.getUTCDay()];
  const dd = String(day).padStart(2, "0");
  const mon = months[m - 1] ?? "???";
  return `${wd} ${dd} ${mon}`;
}

export function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

export function parseTimeToMinutes(s: string): number | null {
  const t = s.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!t) return null;
  const h = Number(t[1]);
  const m = Number(t[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function minutesToTimeInput(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
