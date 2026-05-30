import { Tabs } from "./components/Tabs";
import { Activity } from "react";
import { PaymentView } from "./components/PaymentView/PaymentView";
import { PaymentCategoryView } from "./components/PaymentCategoryView/PaymentCategoryView";
import { CsvExportButton } from "./components/CsvExportButton";

type Props = {
  fileName: string;
  activeTab: "breakdown" | "payments";
};

export function DetailPage({ fileName, activeTab }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Tabs fileName={fileName} activeTab={activeTab} />
        <CsvExportButton fileName={fileName} />
      </div>

      <Activity mode={activeTab === "breakdown" ? "visible" : "hidden"}>
        <PaymentCategoryView fileName={fileName} />
      </Activity>

      <Activity mode={activeTab === "payments" ? "visible" : "hidden"}>
        <PaymentView fileName={fileName} />
      </Activity>
    </div>
  );
}
