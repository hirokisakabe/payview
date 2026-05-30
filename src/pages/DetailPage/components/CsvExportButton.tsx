import { usePaymentsByCategory } from "../../../data/payments";
import { downloadCsv } from "../../../utils/downloadCsv";

type Props = {
  fileName: string;
};

export function CsvExportButton({ fileName }: Props) {
  const result = usePaymentsByCategory({ fileName });

  const handleExport = () => {
    if (result.status !== "completed") return;

    const rows: string[][] = [["日付", "金額", "カテゴリ", "説明"]];

    for (const item of result.breakdown) {
      const categoryName = item.category?.name ?? "未分類";
      for (const payment of item.payments) {
        rows.push([
          payment.date,
          String(payment.price),
          categoryName,
          payment.name,
        ]);
      }
    }

    const baseName = fileName.replace(/\.[^.]+$/, "");
    downloadCsv(`${baseName}.csv`, rows);
  };

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={handleExport}
      disabled={result.status !== "completed"}
    >
      CSVエクスポート
    </button>
  );
}
