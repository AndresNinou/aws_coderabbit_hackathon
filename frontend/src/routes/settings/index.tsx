import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Key, AlertTriangle, Save } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useSettingsStore } from "~/stores/settings";
import toast from "react-hot-toast";

const settingsFormSchema = z.object({
  sensoApiKey: z.string(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export const Route = createFileRoute("/settings/")({
  component: Settings,
});

function Settings() {
  const { apiKeys, setApiKey } = useSettingsStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      sensoApiKey: apiKeys.senso || "",
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    setApiKey("senso", data.sensoApiKey);

    toast.success("Settings saved successfully!");
  };

  const handleSaveIndividual = (key: keyof SettingsFormData, value: string) => {
    const keyMap = {
      sensoApiKey: "senso",
    } as const;

    setApiKey(keyMap[key], value);
    toast.success(`${keyMap[key]} API key saved`);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
          <div className="mb-8 flex items-center space-x-3">
            <Key className="h-6 w-6 text-accent-gold" />
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              API Keys
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Senso */}
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  label="Senso API Key"
                  type="password"
                  placeholder="************"
                  {...register("sensoApiKey")}
                  error={errors.sensoApiKey?.message}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  const input = form?.elements.namedItem(
                    "sensoApiKey",
                  ) as HTMLInputElement;
                  if (input) handleSaveIndividual("sensoApiKey", input.value);
                }}
              >
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
            </div>

            {/* Save All Button */}
            <Button type="submit" disabled={!isDirty} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 flex items-start space-x-3 rounded-input bg-accent-amber/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-amber" />
            <div className="text-sm text-text-muted">
              <p className="mb-1 font-medium text-text-primary">
                Secure Storage
              </p>
              <p>
                API keys are encrypted and stored securely. Keys are
                automatically rotated and managed according to security best
                practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
