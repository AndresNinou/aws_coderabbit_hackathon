import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Shield, QrCode, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export const Route = createFileRoute("/certificate/$certificateId/")({
  component: Certificate,
});

function Certificate() {
  const { certificateId } = Route.useParams();

  // Mock certificate data
  const certificateData = {
    target: "mcp.example.com",
    runId: "#124",
    issued: "2025-01-19",
    techniquesChecked: ["INPUT_STRICTNESS", "AUTH/TLS", "OUTPUT_SAFETY"],
    results: {
      passed: 1,
      failed: 2,
      skipped: 0,
    },
    riskScore: 58,
    hash: "1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef123456",
    verifyUrl: `/verify?hash=1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef123456`,
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
          {/* Kintsu Seal */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent-gold bg-bg-base shadow-glow">
              <div className="relative h-12 w-12 rounded-full border-2 border-accent-gold">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-0.5 transform bg-accent-gold"></div>
                <Shield className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transform text-accent-gold" />
              </div>
            </div>
            <h1 className="mb-2 font-heading text-2xl font-bold text-accent-gold">
              Hermetiq Seal
            </h1>
            <p className="italic text-text-muted">
              repair the cracks. certify the gold.
            </p>
          </div>

          {/* Certificate Details */}
          <div className="mb-8 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-text-muted">Target</span>
                <p className="font-mono font-medium text-text-primary">
                  {certificateData.target}
                </p>
              </div>
              <div>
                <span className="text-sm text-text-muted">Run</span>
                <p className="font-mono font-medium text-text-primary">
                  {certificateData.runId}
                </p>
              </div>
              <div>
                <span className="text-sm text-text-muted">Issued</span>
                <p className="font-mono font-medium text-text-primary">
                  {certificateData.issued}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-text-muted">
                  Techniques Checked
                </span>
                <p className="font-mono text-sm text-text-primary">
                  {certificateData.techniquesChecked.join(", ")}
                </p>
              </div>
              <div>
                <span className="text-sm text-text-muted">Results</span>
                <div className="flex space-x-4 text-sm">
                  <span className="text-accent-mint">
                    Passed({certificateData.results.passed})
                  </span>
                  <span className="text-accent-red">
                    Failed({certificateData.results.failed})
                  </span>
                  <span className="text-text-muted">
                    Skipped({certificateData.results.skipped})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-text-muted">Risk Score</span>
                <p className="font-mono text-2xl font-bold text-accent-amber">
                  {certificateData.riskScore}
                </p>
              </div>
            </div>
          </div>

          {/* Download & Verify Actions */}
          <div className="mb-8 flex flex-wrap gap-4">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Link to={certificateData.verifyUrl}>
              <Button variant="secondary">
                <Shield className="mr-2 h-4 w-4" />
                Verify Hash
              </Button>
            </Link>
          </div>

          {/* Hash & QR Code */}
          <div className="mb-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                label="Certificate Hash"
                value={certificateData.hash}
                readOnly
                copyable
                className="font-mono text-sm"
              />
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex h-32 w-32 items-center justify-center rounded-input border border-stroke bg-bg-base">
                <QrCode className="h-16 w-16 text-text-muted" />
              </div>
              <p className="text-xs text-text-muted">QR opens verify page</p>
            </div>
          </div>

          {/* Sponsor Attribution */}
          <div className="border-t border-stroke pt-6 text-center">
            <p className="text-sm text-text-muted">
              Stored in{" "}
              <span className="font-medium text-accent-blue">Senso</span>
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <a
                href="https://senso.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Senso Record
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
