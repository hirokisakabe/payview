import { Link } from "@tanstack/react-router";
import { usePaymentsBreakdown } from "../data/usePaymentsBreakdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

type Props = {
  fileName: string;
};

export function PaymentsBreakdownPage({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });

  return (
    <>
      <h2 className="text-primary-content text-lg">{fileName}</h2>

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paymentsBreakdown.breakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.total} 円</td>
                  <td>
                    <button
                      className="btn btn-square"
                      type="button"
                      onClick={() =>
                        document.getElementById("my_modal_1").showModal()
                      }
                    >
                      <EllipsisHorizontalIcon className="size-3" />
                    </button>
                    <dialog id="my_modal_1" className="modal">
                      <div className="modal-box">
                        <h3 className="text-lg font-bold">グループ化</h3>
                        <p className="py-4">
                          次の項目をグループ化します。<br />{item.name}
                        </p>
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn" type="button">
                              キャンセル
                            </button>
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn" type="button">
                              キャンセル
                            </button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
