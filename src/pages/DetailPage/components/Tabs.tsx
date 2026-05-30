import { Link, Outlet } from "@tanstack/react-router";
import clsx from "clsx";
import { FileNavigation } from "./FileNavigation";
import { TotalAmount } from "./TotalAmount";
import { CsvExportButton } from "./CsvExportButton";

type Props = {
  fileName: string;
  activeTab: "breakdown" | "payments";
};

export function Tabs({ fileName, activeTab }: Props) {
  return (
    <>
      <FileNavigation fileName={fileName} activeTab={activeTab} />

      <div className="flex items-center justify-between">
        <TotalAmount fileName={fileName} />
        <CsvExportButton fileName={fileName} />
      </div>

      <div role="tablist" className="tabs tabs-border">
        <Link
          role="tab"
          className={clsx("tab", activeTab === "breakdown" && "tab-active")}
          to="/payments/$fileName"
          params={{ fileName }}
          search={{ tab: "breakdown" }}
        >
          内訳
        </Link>

        <Link
          role="tab"
          className={clsx("tab", activeTab === "payments" && "tab-active")}
          to="/payments/$fileName"
          params={{ fileName }}
          search={{ tab: "payments" }}
        >
          支払い一覧
        </Link>
      </div>
      <Outlet />
    </>
  );
}
