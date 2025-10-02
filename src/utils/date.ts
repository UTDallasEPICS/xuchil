export function keyFromLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseMXDateLocal(raw: string): Date {
  const [dd, mm, yyyy] = raw.split("/").map(Number);
  return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1);
}