import { createFileRoute } from "@tanstack/react-router";
import { PaymentsBreakdownPage } from "../pages/PaymentsBreakdownPage";

export const Route = createFileRoute("/breakdown/$fileName")({
  component: _PaymentsBreakdownPage,
});

function _PaymentsBreakdownPage() {
  const { fileName } = Route.useParams();
  return <PaymentsBreakdownPage fileName={fileName} />;
}
