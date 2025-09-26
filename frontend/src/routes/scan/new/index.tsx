import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Key, Info } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { SecretsModal } from "~/components/SecretsModal";
import toast from "react-hot-toast";

const scanFormSchema = z.object({
  target: z.string().min(1, "Target is required"),
  targetType: z.enum(["url", "github"]),
});

type ScanFormData = z.infer<typeof scanFormSchema>;

export const Route = createFileRoute("/scan/new/")({
  validateSearch: z.object({
    url: z.string().optional(),
  }),
  component: NewScan,
});

function NewScan() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/scan/new/" });
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [secrets, setSecrets] = useState<{ name: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScanFormData>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      target: search.url || "",
      targetType: "url",
    },
  });

  const targetType = watch("targetType");

  const onSubmit = async (data: ScanFormData) => {
    try {
      // Generate a unique runId (mock for now)
      const runId = `run-${Math.random().toString(36).substr(2, 9)}`;

      toast.success("Scan started successfully!");

      navigate({
        to: `/runs/${runId}`,
        search: {
          target: data.target,
          type: data.targetType,
        },
      });
    } catch (error) {
      toast.error("Failed to start scan");
    }
  };

  const handleSecretsSubmit = (
    newSecrets: { name: string; value: string }[],
  ) => {
    setSecrets(newSecrets);
    setShowSecretsModal(false);
    toast.success("API keys configured for this run");
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
          <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">
            New Security Scan
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Target Input */}
            <div>
              <Input
                label="Target"
                placeholder="https://mcp.example.com or github.com/org/repo"
                {...register("target")}
                error={errors.target?.message}
              />
            </div>

            {/* Target Type Selection */}
            <div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-text-primary">
                  Target Type
                </legend>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="url"
                      {...register("targetType")}
                      className="h-4 w-4 border-stroke bg-bg-base text-accent-gold focus:ring-accent-mint focus:ring-offset-bg-base"
                    />
                    <span className="text-text-primary">Remote MCP URL</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="github"
                      {...register("targetType")}
                      className="h-4 w-4 border-stroke bg-bg-base text-accent-gold focus:ring-accent-mint focus:ring-offset-bg-base"
                    />
                    <span className="text-text-primary">GitHub Repo</span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="sm:order-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                    Starting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Analyze
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSecretsModal(true)}
                className="sm:order-2"
              >
                <Key className="mr-2 h-4 w-4" />
                Provide API Keys
                {secrets.length > 0 && (
                  <span className="ml-2 rounded-full bg-accent-mint px-2 py-0.5 text-xs text-bg-base">
                    {secrets.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Info Message */}
            <div className="flex items-start space-x-3 rounded-input bg-accent-blue/10 p-4">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-blue" />
              <div className="text-sm text-text-muted">
                <p className="mb-1 font-medium text-text-primary">
                  SAFE-MCP Security Analysis
                </p>
                <p>
                  Comprehensive security assessment using the SAFE-MCP framework
                  with real-time vulnerability detection and automated
                  remediation capabilities.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Secrets Modal */}
      <SecretsModal
        isOpen={showSecretsModal}
        onClose={() => setShowSecretsModal(false)}
        onSubmit={handleSecretsSubmit}
        initialSecrets={secrets}
      />
    </div>
  );
}
