import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-7xl flex-grow px-10 pt-5 pb-10">
          <header className="mb-5 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <Link to="/">payview</Link>
            </h1>
            <Link to="/settings" className="btn btn-ghost btn-sm">
              設定
            </Link>
          </header>

          <Outlet />
        </div>

        <footer className="bg-base-200 text-base-content/60 py-6 text-center text-xs">
          <div className="mx-auto max-w-7xl px-10">
            <p>本アプリは特定の金融機関とは一切関係ありません</p>
            <p>
              CSVデータはブラウザ内でのみ処理され、外部サーバーには送信されません
            </p>
            <p className="mt-3">
              <a
                href="https://github.com/hirokisakabe/payview"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover inline-flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>

      <Analytics />
      <TanStackRouterDevtools />
    </>
  ),
});
