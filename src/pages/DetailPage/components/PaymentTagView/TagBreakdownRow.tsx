import { useState } from "react";
import { PaymentDetailTable } from "./PaymentDetailTable";

type PaymentDetail = {
  name: string;
  date: string;
  price: number;
};

type TagInfo = {
  id: string;
  name: string;
} | null;

type TagBreakdownItem = {
  tag: TagInfo;
  total: number;
  count: number;
  name?: string;
  payments: PaymentDetail[];
};

type Props = {
  item: TagBreakdownItem;
  index: number;
};

export function TagBreakdownRow({ item, index }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        key={item.tag?.id || `untagged-${index}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-base-200 cursor-pointer"
      >
        <td>
          <span className="text-base-content/60 mr-2">
            {isExpanded ? "▼" : "▶"}
          </span>
          {item.tag ? (
            <span className="badge badge-primary">{item.tag.name}</span>
          ) : (
            <span className="text-base-content/60">{item.name}</span>
          )}
        </td>
        <td>{item.count} 件</td>
        <td>{item.total.toLocaleString()} 円</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={3} className="p-0">
            <PaymentDetailTable payments={item.payments} />
          </td>
        </tr>
      )}
    </>
  );
}
