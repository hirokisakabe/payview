import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="mx-auto max-w-7xl px-10 pt-5 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <Link to="/">payview</Link>
          </h1>
          <Link to="/settings" className="btn btn-ghost btn-sm">
            設定
          </Link>
        </div>

        <Outlet />
      </div>

      <footer className="bg-base-200 text-base-content/60 py-6 text-center text-xs">
        <div className="mx-auto max-w-7xl px-10">
          <p>本アプリは特定の金融機関とは一切関係ありません</p>
          <p>
            CSVデータはブラウザ内でのみ処理され、外部サーバーには送信されません
          </p>
        </div>
      </footer>

      <Analytics />
      <TanStackRouterDevtools />
    </>
  ),
});
