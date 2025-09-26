import {
  Link,
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "~/trpc/react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <TRPCReactProvider>
      <div className="min-h-screen bg-bg-base">
        {/* Header Navigation */}
        <header className="border-b border-stroke bg-bg-elev">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center">
                  <div className="relative">
                    {/* Hexagonal shield shape */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-seal-mint-500"
                      role="img"
                      aria-labelledby="hermetiq-logo-title"
                    >
                      <title id="hermetiq-logo-title">Hermetiq Logo</title>
                      <path
                        d="M16 2L26 8V18L16 24L6 18V8L16 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M12 12L16 16L20 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <span className="font-heading text-xl font-bold text-text-primary">
                  HERMETIQ
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden items-center space-x-8 md:flex">
                <Link
                  to="/discover"
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  Discover
                </Link>
                <Link
                  to="/scan/new"
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  Analyze
                </Link>
                <Link
                  to="/chat"
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  Chat with Hermes
                </Link>
                <Link
                  to="/settings"
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  Settings
                </Link>
                <Link
                  to="/scan/new"
                  className="rounded-input border border-seal-mint-600 bg-seal-mint-600 px-4 py-2 text-sm font-medium text-bg-base transition-all hover:border-seal-mint-700 hover:bg-seal-mint-700"
                >
                  New Scan ▸
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {isFetching && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="seam-loader h-2 w-32 overflow-hidden rounded-full bg-stroke"></div>
                <span className="text-text-muted">Loading...</span>
              </div>
            </div>
          )}
          <Outlet />
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#13161B",
              color: "#E7ECF5",
              border: "1px solid #222834",
              borderRadius: "12px",
            },
            success: {
              iconTheme: {
                primary: "#6FFFD4",
                secondary: "#13161B",
              },
            },
            error: {
              iconTheme: {
                primary: "#FF4D4D",
                secondary: "#13161B",
              },
            },
          }}
        />
      </div>
    </TRPCReactProvider>
  );
}
