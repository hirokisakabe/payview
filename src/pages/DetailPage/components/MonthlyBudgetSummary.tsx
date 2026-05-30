import clsx from "clsx";
import { useMonthlyBudgetSummary } from "../../../data";
import { formatYen } from "../../../utils/formatYen";

type Props = {
  fileName: string;
};

export function MonthlyBudgetSummary({ fileName }: Props) {
  const result = useMonthlyBudgetSummary({ fileName });

  if (result.status === "loading") {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-primary-content text-lg">月予算</h2>
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  if (result.items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-primary-content text-lg">月予算</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th>月予算</th>
              <th>今月の支出</th>
              <th>残り</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.categoryId}>
                <td className="font-medium">{item.categoryName}</td>
                <td>
                  {item.monthlyBudget !== undefined ? (
                    formatYen(item.monthlyBudget)
                  ) : (
                    <span className="text-base-content/40">未設定</span>
                  )}
                </td>
                <td>{formatYen(item.fileTotal)}</td>
                <td>
                  {item.remaining !== undefined ? (
                    <span
                      className={clsx(
                        "font-medium",
                        item.remaining >= 0 ? "text-success" : "text-error",
                      )}
                    >
                      {item.remaining >= 0 ? "" : "−"}
                      {formatYen(Math.abs(item.remaining))}
                    </span>
                  ) : (
                    <span className="text-base-content/30">−</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
