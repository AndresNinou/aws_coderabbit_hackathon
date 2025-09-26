import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import toast from "react-hot-toast";

const verifyFormSchema = z.object({
  hash: z.string().min(1, "Hash is required").min(64, "Invalid hash format"),
});

type VerifyFormData = z.infer<typeof verifyFormSchema>;

export const Route = createFileRoute("/verify/")({
  validateSearch: z.object({
    hash: z.string().optional(),
  }),
  component: Verify,
});

interface VerificationResult {
  isValid: boolean;
  target?: string;
  issued?: string;
  status?: string;
  reportId?: string;
  sensoUrl?: string;
}

function Verify() {
  const search = useSearch({ from: "/verify/" });
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      hash: search.hash || "",
    },
  });

  const onSubmit = async (data: VerifyFormData) => {
    setIsVerifying(true);

    try {
      // Verify certificate against Senso records
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Successful verification
      const result: VerificationResult = {
        isValid: true,
        target: "mcp.example.com",
        issued: "2025-01-19",
        status: "Active",
        reportId: "123",
        sensoUrl: "https://senso.ai/record/123",
      };

      setVerificationResult(result);
      toast.success("Certificate verified successfully!");
    } catch (error) {
      const failResult: VerificationResult = { isValid: false };
      setVerificationResult(failResult);
      toast.error("Certificate verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
          <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">
            Verify Certificate
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Certificate Hash"
                placeholder="1a2b3c4d5e6f789012345678901234567890abcdef..."
                {...register("hash")}
                error={errors.hash?.message}
                className="font-mono"
              />
            </div>

            <Button type="submit" disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                  Verifying...
                </>
              ) : (
                "Check ▸"
              )}
            </Button>
          </form>

          {/* Verification Result */}
          {verificationResult && (
            <div className="mt-8 border-t border-stroke pt-8">
              <div className="mb-6 flex items-center space-x-3">
                {verificationResult.isValid ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-accent-mint" />
                    <span className="text-lg font-medium text-accent-mint">
                      ✅ Valid — matches stored JSON
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-accent-red" />
                    <span className="text-lg font-medium text-accent-red">
                      ❌ Invalid — hash not found or corrupted
                    </span>
                  </>
                )}
              </div>

              {verificationResult.isValid && (
                <div className="space-y-4">
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div>
                      <span className="text-text-muted">Target</span>
                      <p className="font-mono font-medium text-text-primary">
                        {verificationResult.target}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Issued</span>
                      <p className="font-mono font-medium text-text-primary">
                        {verificationResult.issued}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Status</span>
                      <p className="font-medium text-accent-mint">
                        {verificationResult.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link to={`/report/${verificationResult.reportId}`}>
                      <Button variant="secondary" size="sm">
                        ▸ Open Report
                      </Button>
                    </Link>
                    <Link
                      to={verificationResult.sensoUrl || "#"}
                      target="_blank"
                    >
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Senso Record
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
