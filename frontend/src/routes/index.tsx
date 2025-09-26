import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Shield, GitPullRequest } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [targetUrl, setTargetUrl] = useState("");

  // Recent scans data
  const recentScans = [
    {
      id: "1",
      target: "mcp.example.com",
      score: 82,
      status: "PASS",
      date: "2025-01-19",
    },
    {
      id: "2",
      target: "github.com/foo/mcp",
      score: 41,
      status: "FAIL",
      date: "2025-01-18",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(32,210,181,0.1),transparent_50%)]"></div>

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          {/* Main Heading */}
          <h1 className="mb-6 font-heading text-4xl font-bold text-mist-100 lg:text-6xl">
            Seal every merge.
          </h1>

          <p className="mb-12 text-xl text-mist-300 lg:text-2xl">
            Fixes, not tickets. Surgical security analysis for MCPs.
          </p>

          {/* Input Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="w-full max-w-lg flex-1">
                <Input
                  type="url"
                  placeholder="https://mcp.example.com or github.com/org/repo"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="text-center sm:text-left"
                />
              </div>
              <Link to="/scan/new" search={{ url: targetUrl }}>
                <Button
                  size="lg"
                  className="w-full border-seal-mint-600 bg-seal-mint-600 text-bg-base hover:border-seal-mint-700 hover:bg-seal-mint-700 sm:w-auto"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  New Scan ▸
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-mist-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-seal-mint-500" />
              <span>Minimal diff</span>
            </div>
            <div className="flex items-center space-x-2">
              <GitPullRequest className="h-4 w-4 text-seal-mint-500" />
              <span>Merge-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Scans Section */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 font-heading text-2xl font-semibold text-mist-100">
          Recent Scans
        </h2>

        <div className="border-mist-300/12 overflow-hidden rounded-card border bg-ink-800 shadow-ambient">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-mist-300/12 border-b bg-ink-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-mist-300">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-mist-300">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-mist-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-mist-300">
                    Fix
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan, index) => (
                  <tr
                    key={scan.id}
                    className={index % 2 === 0 ? "bg-ink-800" : "bg-ink-900"}
                  >
                    <td className="px-6 py-4 font-mono text-sm text-mist-100">
                      {scan.target}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-mist-100">
                          {scan.score}
                        </span>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            scan.score >= 70
                              ? "bg-seal-mint-500"
                              : scan.score >= 40
                                ? "bg-seal-amber-500"
                                : "bg-danger"
                          }`}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-chip px-3 py-1 text-xs font-medium ${
                          scan.status === "PASS"
                            ? "bg-seal-mint-500/20 text-seal-mint-500"
                            : "bg-danger/20 text-danger"
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/report/$reportId"
                        params={{ reportId: scan.id }}
                      >
                        <Button variant="secondary" size="sm">
                          Open Fix Card
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-mist-300/12 border-t bg-ink-800">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-center text-sm text-mist-300">
            Surgical security analysis • Proof test validation • Merge-ready
            fixes
          </p>
        </div>
      </section>
    </div>
  );
}
