import { Link } from "@tanstack/react-router";
import { usePaymentsBreakdown } from "../data/usePaymentsBreakdown";

type Props = {
  fileName: string;
};

export function PaymentsBreakdownPage({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });

  return (
    <>
      <h2 className="text-lg">{fileName}</h2>

      <div role="tablist" className="tabs tabs-border">
        <Link
          role="tab"
          className="tab"
          to="/payments/$fileName"
          params={{ fileName }}
        >
          支払い一覧
        </Link>
        <Link
          role="tab"
          className="tab tab-active"
          to="/breakdown/$fileName"
          params={{ fileName }}
        >
          内訳
        </Link>
      </div>

      {paymentsBreakdown.status === "loading" ? (
        <div className="w-max mx-auto">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>項目</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {paymentsBreakdown.breakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.total} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
