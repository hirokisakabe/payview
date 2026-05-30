function sanitizeCell(cell: string): string {
  const escaped = cell.replace(/"/g, '""');
  // CSV injection 対策: =,+,-,@ で始まる値の前に ' を付与
  if (/^[=+\-@]/.test(escaped)) {
    return `"'${escaped}"`;
  }
  return `"${escaped}"`;
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const csvContent = rows
    .map((row) => row.map(sanitizeCell).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
