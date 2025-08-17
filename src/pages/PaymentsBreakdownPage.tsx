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
                <th>グループ化</th>
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
                      popoverTarget={`popover-${index}`}
                      style={
                        {
                          anchorName: `--anchor-${index}`,
                        } /* as React.CSSProperties */
                      }
                    >
                      <EllipsisHorizontalIcon className="size-3" />
                    </button>
                    <ul
                      className="dropdown menu rounded-box bg-base-100 w-full max-w-40 shadow-sm"
                      popover="auto"
                      id={`popover-${index}`}
                      style={
                        {
                          positionAnchor: `--anchor-${index}`,
                        } /* as React.CSSProperties */
                      }
                    >
                      {[
                        {
                          groupName: "グループA",
                        },
                        {
                          groupName: "グループB",
                        },
                        {
                          groupName: "グループC",
                        },
                      ].map((group, groupIndex) => (
                        <li key={groupIndex}>
                          <button className="btn" type="button">
                            {group.groupName}に移動
                          </button>
                        </li>
                      ))}
                      <li>
                        <button className="btn" type="button">
                          グループを新規に作成して追加
                        </button>
                      </li>
                    </ul>
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
