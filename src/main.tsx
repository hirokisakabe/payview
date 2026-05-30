import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { seedIfNeeded } from "./dev/seed";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const renderApp = () => {
  const rootElement = document.getElementById("root")!;
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  }
};

void seedIfNeeded().then(renderApp, (err) => {
  console.error("seed failed:", err);
  renderApp();
});
