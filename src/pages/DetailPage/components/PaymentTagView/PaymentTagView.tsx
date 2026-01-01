import { Link } from "@tanstack/react-router";
import { usePaymentsByTag } from "../../../../data/usePaymentsByTag";
import { PayviewTagBarChart } from "./PayviewTagBarChart";

type Props = {
  fileName: string;
};

export function PaymentTagView({ fileName }: Props) {
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
            <h3 className="text-secondary-content mb-2 text-lg">
              タグ別集計（上位20件）
            </h3>
            <PayviewTagBarChart data={chartData} />
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
                    <tr key={item.tag?.id || `untagged-${index}`}>
                      <td>
                        {item.tag ? (
                          <span className="badge badge-primary">
                            {item.tag.name}
                          </span>
                        ) : (
                          <span className="text-base-content/60">
                            {item.name}
                          </span>
                        )}
                      </td>
                      <td>{item.count} 件</td>
                      <td>{item.total.toLocaleString()} 円</td>
                    </tr>
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
