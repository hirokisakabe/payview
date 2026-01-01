import { Tabs } from "./components/Tabs";
import { Activity } from "react";
import { PaymentView } from "./components/PaymentView/PaymentView";
import { PaymentCategoryView } from "./components/PaymentCategoryView/PaymentCategoryView";

type Props = {
  fileName: string;
  activeTab: "breakdown" | "payments";
};

export function DetailPage({ fileName, activeTab }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Tabs fileName={fileName} activeTab={activeTab} />

      <Activity mode={activeTab === "breakdown" ? "visible" : "hidden"}>
        <PaymentCategoryView fileName={fileName} />
      </Activity>

      <Activity mode={activeTab === "payments" ? "visible" : "hidden"}>
        <PaymentView fileName={fileName} />
      </Activity>
    </div>
  );
}
