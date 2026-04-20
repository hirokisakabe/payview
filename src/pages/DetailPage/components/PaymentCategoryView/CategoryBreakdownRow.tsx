import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PaymentDetailTable } from "./PaymentDetailTable";
import { formatYen } from "../../../../utils/formatYen";

type PaymentDetail = {
  name: string;
  date: string;
  price: number;
};

type CategoryInfo = {
  id: string;
  name: string;
} | null;

type SubBreakdownItem = {
  name: string;
  total: number;
  count: number;
  payments: PaymentDetail[];
};

type CategoryBreakdownItem = {
  category: CategoryInfo;
  total: number;
  count: number;
  name?: string;
  payments: PaymentDetail[];
  subBreakdown?: SubBreakdownItem[];
};

type Props = {
  item: CategoryBreakdownItem;
  index: number;
};

function SubBreakdownRow({ item }: { item: SubBreakdownItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-base-200 cursor-pointer"
      >
        <td className="pl-8">
          <span className="text-base-content/60 mr-2">
            {isExpanded ? (
              <ChevronDownIcon className="inline h-4 w-4" />
            ) : (
              <ChevronRightIcon className="inline h-4 w-4" />
            )}
          </span>
          <span className="text-base-content/60">{item.name}</span>
        </td>
        <td>{item.count} 件</td>
        <td>{formatYen(item.total)}</td>
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

export function CategoryBreakdownRow({ item, index }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSubBreakdown = item.subBreakdown && item.subBreakdown.length > 0;

  return (
    <>
      <tr
        key={item.category?.id || `uncategorized-${index}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-base-200 cursor-pointer"
      >
        <td>
          <span className="text-base-content/60 mr-2">
            {isExpanded ? (
              <ChevronDownIcon className="inline h-4 w-4" />
            ) : (
              <ChevronRightIcon className="inline h-4 w-4" />
            )}
          </span>
          {item.category ? (
            <span className="badge badge-primary">{item.category.name}</span>
          ) : (
            <span className="text-base-content/60">未分類</span>
          )}
        </td>
        <td>{item.count} 件</td>
        <td>{formatYen(item.total)}</td>
      </tr>

      {isExpanded &&
        (hasSubBreakdown
          ? item.subBreakdown!.map((sub) => (
              <SubBreakdownRow key={sub.name} item={sub} />
            ))
          : item.payments.length > 0 && (
              <tr>
                <td colSpan={3} className="p-0">
                  <PaymentDetailTable payments={item.payments} />
                </td>
              </tr>
            ))}
    </>
  );
}
