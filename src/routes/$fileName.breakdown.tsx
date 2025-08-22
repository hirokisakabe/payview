import { createFileRoute } from "@tanstack/react-router";
import { PaymentsBreakdownPage } from "../pages/PaymentsBreakdownPage";

export const Route = createFileRoute("/$fileName/breakdown")({
  component: _PaymentsBreakdownPage,
});

function _PaymentsBreakdownPage() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fileName } = Route.useParams();
  return <PaymentsBreakdownPage fileName={fileName} />;
}
