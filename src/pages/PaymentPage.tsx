import { usePayments } from "../data/usePayments";
import { Tabs } from "./components/Tabs";

type Props = {
  fileName: string;
};

export function PaymentPage({ fileName }: Props) {
  const payments = usePayments({ fileName });

  return (
    <>
      <Tabs fileName={fileName} activeTab="payments" />

      {payments.status === "loading" ? (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>利用日</th>
                <th>項目</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {payments.payments.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.price.toLocaleString()} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
