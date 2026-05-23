import clsx from "clsx";
import { useAnnualBudgetSummary } from "../../../data";
import { formatYen } from "../../../utils/formatYen";

export function AnnualBudgetSummary() {
  const result = useAnnualBudgetSummary();

  if (result.status === "loading") {
    return (
      <div className="flex justify-center py-4">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (result.items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>年予算</th>
            <th>今年の支出</th>
            <th>残り</th>
          </tr>
        </thead>
        <tbody>
          {result.items.map((item) => (
            <tr key={item.categoryId}>
              <td className="font-medium">{item.categoryName}</td>
              <td>
                <span>{formatYen(item.annualBudget)}</span>
                {item.isFallback && (
                  <span className="badge badge-ghost badge-sm ml-2">暫定</span>
                )}
              </td>
              <td>{formatYen(item.currentYearTotal)}</td>
              <td>
                <span
                  className={clsx(
                    "font-medium",
                    item.remaining >= 0 ? "text-success" : "text-error",
                  )}
                >
                  {item.remaining >= 0 ? "" : "−"}
                  {formatYen(Math.abs(item.remaining))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
