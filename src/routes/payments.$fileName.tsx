import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "../pages/DetailPage/DetailPage";
import { z } from "zod";

const SearchSchema = z.object({
  tab: z.enum(["payments", "breakdown"]).default("payments"),
});

export const Route = createFileRoute("/payments/$fileName")({
  component: _PaymentPage,
  validateSearch: SearchSchema,
});

function _PaymentPage() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fileName } = Route.useParams();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { tab } = Route.useSearch();

  return <DetailPage fileName={fileName} activeTab={tab} />;
}
