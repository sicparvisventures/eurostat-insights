/** Chart colors reference the theme CSS variables so they adapt to light/dark. */
export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

export const PRIMARY = "var(--color-primary)";
export const MUTED_FG = "var(--color-muted-foreground)";
export const BORDER = "var(--color-border)";

export function colorAt(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}

/** Pretty-print Eurostat time codes (2024-01 → Jan '24, 2024-Q1 → Q1 '24). */
export function formatTimeLabel(code: string): string {
  const m = code.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const month = new Date(2000, Number(m[2]) - 1, 1).toLocaleString("en", {
      month: "short",
    });
    return `${month} '${m[1].slice(2)}`;
  }
  const q = code.match(/^(\d{4})-?Q([1-4])$/);
  if (q) return `Q${q[2]} '${q[1].slice(2)}`;
  return code;
}
