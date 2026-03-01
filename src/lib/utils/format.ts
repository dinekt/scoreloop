/**
 * Format a number as percentage string.
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Format score relative to par (e.g. "+5", "-2", "E").
 */
export function formatScoreToPar(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "E";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}
