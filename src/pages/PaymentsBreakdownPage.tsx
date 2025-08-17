import { usePaymentsBreakdown } from "../data/usePaymentsBreakdown";
import { Tabs } from "./components/Tabs";

type Props = {
  fileName: string;
};

export function PaymentsBreakdownPage({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });

  return (
    <>
      <Tabs fileName={fileName} activeTab="breakdown" />

      {paymentsBreakdown.status === "loading" ? (
        <div className="mx-auto w-max">
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
                  <td>{item.total.toLocaleString()} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
