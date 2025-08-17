import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

type Props = {
  breakdownItem: {
    name: string;
    total: number;
  };
};

const groups = [
  {
    groupName: "グループA",
  },
  {
    groupName: "グループB",
  },
  {
    groupName: "グループC",
  },
];

export function PaymentGroup({ breakdownItem }: Props) {
  const popoverId = `popover-${breakdownItem.name}`;
  const anchorName = `--anchor-${breakdownItem.name}`;

  const handleAddItemToGroupButtonClick = (groupName: string) => {
    // Add item to the group
  };

  const handleCreateNewGroupButtonClick = () => {
    // Create a new group and add the item to it
  };

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
        {groups.map((group) => (
          <li key={group.groupName}>
            <button
              className="btn"
              type="button"
              onClick={() => handleAddItemToGroupButtonClick(group.groupName)}
            >
              {group.groupName}に移動
            </button>
          </li>
        ))}
        <li>
          <button
            className="btn"
            type="button"
            onClick={handleCreateNewGroupButtonClick}
          >
            グループを新規に作成して追加
          </button>
        </li>
      </ul>
    </>
  );
}
