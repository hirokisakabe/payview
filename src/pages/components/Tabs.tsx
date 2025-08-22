import { Link, Outlet } from "@tanstack/react-router";
import { memo } from "react";

type Props = {
  fileName: string;
};

export const Tabs = memo(function Tabs({ fileName }: Props) {
  return (
    <>
      <h2 className="text-primary-content text-lg">{fileName}</h2>

      <div role="tablist" className="tabs tabs-border">
        <Link
          role="tab"
          to="/$fileName/payments"
          params={{ fileName }}
          activeProps={{ className: "tab tab-active" }}
          inactiveProps={{ className: "tab" }}
        >
          支払い一覧
        </Link>

        <Link
          role="tab"
          to="/$fileName/breakdown"
          params={{ fileName }}
          activeProps={{ className: "tab tab-active" }}
          inactiveProps={{ className: "tab" }}
        >
          内訳
        </Link>
      </div>
      <Outlet />
    </>
  );
});
