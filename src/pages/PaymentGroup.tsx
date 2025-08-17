import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

type Props = {
  breakdownItem: {
    name: string;
    total: number;
  };
};

export function PaymentGroup({ breakdownItem }: Props) {
  const popoverId = `popover-${breakdownItem.name}`;
  const anchorName = `--anchor-${breakdownItem.name}`;

  return (
    <>
      <button
        className="btn btn-square"
        type="button"
        popoverTarget={popoverId}
        style={
          {
            anchorName,
          } /* as React.CSSProperties */
        }
      >
        <EllipsisHorizontalIcon className="size-3" />
      </button>
      <ul
        className="dropdown menu rounded-box bg-base-100 w-full max-w-40 shadow-sm"
        popover="auto"
        id={popoverId}
        style={
          {
            positionAnchor: anchorName,
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
        ].map((group) => (
          <li key={group.groupName}>
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
    </>
  );
}
