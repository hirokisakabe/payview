import { Tabs } from "./components/Tabs";
import { Activity } from "react";
import { PaymentBreakdownView } from "./components/PaymentBreakdownView/PaymentBreakdownView";
import { PaymentView } from "./components/PaymentView/PaymentView";
import { MonthlyBreakdownView } from "./components/MonthlyBreakdownView/MonthlyBreakdownView";

type Props = {
  fileName: string;
  activeTab: "payments" | "breakdown" | "monthly";
};

export function DetailPage({ fileName, activeTab }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Tabs fileName={fileName} activeTab={activeTab} />

      <Activity mode={activeTab === "payments" ? "visible" : "hidden"}>
        <PaymentView fileName={fileName} />
      </Activity>

      <Activity mode={activeTab === "breakdown" ? "visible" : "hidden"}>
        <PaymentBreakdownView fileName={fileName} />
      </Activity>

      <Activity mode={activeTab === "monthly" ? "visible" : "hidden"}>
        <MonthlyBreakdownView fileName={fileName} />
      </Activity>
    </div>
  );
}
