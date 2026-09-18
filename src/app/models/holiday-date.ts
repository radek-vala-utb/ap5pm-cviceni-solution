// Kalendářní datum zařízení, nikoliv datum odvozené z UTC času.
export function localDateIso(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function daysUntil(target: string, today: string): number {
  // Obě kalendářní data převedeme na UTC půlnoc, aby nevadila změna času.
  const targetTime = Date.parse(`${target}T00:00:00Z`);
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  return Math.round((targetTime - todayTime) / 86_400_000);
}