import { useState } from "react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { usePaymentsByCategory } from "../../../../data/payments";
import { PayviewCategoryBarChart } from "./PayviewCategoryBarChart";
import { PayviewCategoryPieChart } from "./PayviewCategoryPieChart";
import { CategoryBreakdownRow } from "./CategoryBreakdownRow";

type ChartType = "bar" | "pie";

type Props = {
  fileName: string;
};

export function PaymentCategoryView({ fileName }: Props) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const result = usePaymentsByCategory({ fileName });

  if (result.status === "loading") {
    return (
      <div className="mx-auto w-max">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  const { breakdown } = result;

  const chartData = breakdown.slice(0, 20).map((item) => ({
    name: item.category?.name || item.name || "",
    value: item.total,
  }));

  const hasNoData = breakdown.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {hasNoData ? (
        <div className="bg-base-200 rounded-box p-6 text-center">
          <p className="text-base-content/60 mb-2">データがありません</p>
          <Link to="/settings" className="btn btn-primary btn-sm">
            カテゴリを設定する
          </Link>
        </div>
      ) : (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-secondary-content text-lg">
                カテゴリ別集計（上位20件）
              </h3>
              <div className="join">
                <button
                  type="button"
                  className={clsx(
                    "join-item btn btn-sm",
                    chartType === "bar" && "btn-active",
                  )}
                  onClick={() => setChartType("bar")}
                >
                  棒グラフ
                </button>
                <button
                  type="button"
                  className={clsx(
                    "join-item btn btn-sm",
                    chartType === "pie" && "btn-active",
                  )}
                  onClick={() => setChartType("pie")}
                >
                  円グラフ
                </button>
              </div>
            </div>
            {chartType === "bar" ? (
              <PayviewCategoryBarChart data={chartData} />
            ) : (
              <PayviewCategoryPieChart data={chartData} />
            )}
          </div>

          <div>
            <h3 className="text-secondary-content mb-2 text-lg">
              カテゴリ別内訳
            </h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>カテゴリ</th>
                    <th>件数</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item, index) => (
                    <CategoryBreakdownRow
                      key={item.category?.id || `uncategorized-${index}`}
                      item={item}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
