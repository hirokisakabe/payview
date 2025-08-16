import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="mx-auto max-w-7xl px-10 pt-5">
        <h1 className="mb-5 text-xl font-bold">
          <Link to="/">payview</Link>
        </h1>

        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
