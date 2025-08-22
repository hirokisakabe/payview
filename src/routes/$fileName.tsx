import { createFileRoute } from "@tanstack/react-router";
import { Tabs } from "../pages/components/Tabs";

export const Route = createFileRoute("/$fileName")({
  component: _Layout,
});

function _Layout() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fileName } = Route.useParams();
  return <Tabs fileName={fileName} />;
}
