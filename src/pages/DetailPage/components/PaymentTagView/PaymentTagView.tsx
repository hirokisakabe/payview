import { useState } from "react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { usePaymentsByTag } from "../../../../data/payments";
import { PayviewTagBarChart } from "./PayviewTagBarChart";
import { PayviewTagPieChart } from "./PayviewTagPieChart";
import { TagBreakdownRow } from "./TagBreakdownRow";

type ChartType = "bar" | "pie";

type Props = {
  fileName: string;
};

export function PaymentTagView({ fileName }: Props) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const result = usePaymentsByTag({ fileName });

  if (result.status === "loading") {
    return (
      <div className="mx-auto w-max">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  const { breakdown } = result;

  const chartData = breakdown.slice(0, 20).map((item) => ({
    name: item.tag?.name || item.name || "",
    value: item.total,
  }));

  const hasNoData = breakdown.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {hasNoData ? (
        <div className="bg-base-200 rounded-box p-6 text-center">
          <p className="text-base-content/60 mb-2">データがありません</p>
          <Link to="/settings" className="btn btn-primary btn-sm">
            タグを設定する
          </Link>
        </div>
      ) : (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-secondary-content text-lg">
                タグ別集計（上位20件）
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
              <PayviewTagBarChart data={chartData} />
            ) : (
              <PayviewTagPieChart data={chartData} />
            )}
          </div>

          <div>
            <h3 className="text-secondary-content mb-2 text-lg">タグ別内訳</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>タグ</th>
                    <th>件数</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item, index) => (
                    <TagBreakdownRow
                      key={item.tag?.id || `untagged-${index}`}
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
