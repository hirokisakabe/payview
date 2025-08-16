import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="max-w-7xl px-10 mx-auto pt-5">
        <h1 className="text-xl font-bold mb-5">
          <Link to="/">payview</Link>
        </h1>

        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
