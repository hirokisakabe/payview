import { createFileRoute } from "@tanstack/react-router";
import { PaymentPage } from "../pages/PaymentPage";

export const Route = createFileRoute("/$fileName/payments")({
  component: _PaymentPage,
});

function _PaymentPage() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fileName } = Route.useParams();
  return <PaymentPage fileName={fileName} />;
}
