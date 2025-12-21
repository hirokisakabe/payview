import { Link, Outlet } from "@tanstack/react-router";
import clsx from "clsx";
import { TotalAmount } from "./TotalAmount";

type Props = {
  fileName: string;
  activeTab: "payments" | "breakdown";
};

export function Tabs({ fileName, activeTab }: Props) {
  return (
    <>
      <h2 className="text-primary-content text-lg">{fileName}</h2>

      <TotalAmount fileName={fileName} />

      <div role="tablist" className="tabs tabs-border">
        <Link
          role="tab"
          className={clsx("tab", activeTab === "payments" && "tab-active")}
          to="/payments/$fileName"
          params={{ fileName }}
          search={{ tab: "payments" }}
        >
          支払い一覧
        </Link>

        <Link
          role="tab"
          className={clsx("tab", activeTab === "breakdown" && "tab-active")}
          to="/payments/$fileName"
          params={{ fileName }}
          search={{ tab: "breakdown" }}
        >
          内訳
        </Link>
      </div>
      <Outlet />
    </>
  );
}
