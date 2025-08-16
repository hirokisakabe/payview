import { Link } from "@tanstack/react-router";
import { usePayments } from "../data/usePayments";

type Props = {
  fileName: string;
};

export function PaymentPage({ fileName }: Props) {
  const payments = usePayments({ fileName });

  return (
    <>
      <h2 className="text-lg text-primary-content">{fileName}</h2>

      <div role="tablist" className="tabs tabs-border">
        <Link
          role="tab"
          className="tab tab-active"
          to="/payments/$fileName"
          params={{ fileName }}
        >
          支払い一覧
        </Link>
        <Link
          role="tab"
          className="tab"
          to="/breakdown/$fileName"
          params={{ fileName }}
        >
          内訳
        </Link>
      </div>

      {payments.status === "loading" ? (
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
              {payments.payments.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.price} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
