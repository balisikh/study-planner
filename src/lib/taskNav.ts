/** Deep-link from Schedule / Dashboard / Timetable into Tasks. */
export function hrefTask(taskId: string): string {
  return `/tasks#task-${encodeURIComponent(taskId)}`;
}

export function parseTaskHash(hash: string): string | null {
  if (!hash.startsWith("#task-")) return null;
  return decodeURIComponent(hash.slice("#task-".length));
}
