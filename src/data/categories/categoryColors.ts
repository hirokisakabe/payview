export const DEFAULT_CATEGORY_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export function getDefaultColor(index: number): string {
  return DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length];
}
