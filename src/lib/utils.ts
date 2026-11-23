export const INSCRIPTION_FEE = 1000;

export const CLASSES = ["6e", "5e", "4e", "3e"] as const;

export type ClassLevel = (typeof CLASSES)[number];

export const CLASS_LABELS: Record<ClassLevel, string> = {
  "6e": "Sixième",
  "5e": "Cinquième",
  "4e": "Quatrième",
  "3e": "Troisième",
};

export function isClassLevel(value: string): value is ClassLevel {
  return (CLASSES as readonly string[]).includes(value);
}

export function formatFCFA(amount: number | null | undefined): string {
  const n = Math.round(Number(amount ?? 0));
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} FCFA`;
}

function parseLocalDate(d: string): Date | null {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

export function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const b = parseLocalDate(birthDate);
  if (!b) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const month = now.getMonth() - b.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const date = parseLocalDate(d);
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
