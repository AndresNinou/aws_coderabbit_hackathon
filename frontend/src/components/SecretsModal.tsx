import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

const secretsFormSchema = z.object({
  secrets: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      value: z.string().min(1, "Value is required"),
    }),
  ),
});

type SecretsFormData = z.infer<typeof secretsFormSchema>;

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (secrets: { name: string; value: string }[]) => void;
  initialSecrets?: { name: string; value: string }[];
}

export function SecretsModal({
  isOpen,
  onClose,
  onSubmit,
  initialSecrets = [],
}: SecretsModalProps) {
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SecretsFormData>({
    resolver: zodResolver(secretsFormSchema),
    defaultValues: {
      secrets:
        initialSecrets.length > 0
          ? initialSecrets
          : [{ name: "Authorization", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "secrets",
  });

  const handleClose = () => {
    reset();
    setShowValues({});
    onClose();
  };

  const handleFormSubmit = (data: SecretsFormData) => {
    onSubmit(data.secrets);
    handleClose();
  };

  const toggleShowValue = (index: number) => {
    setShowValues((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient transition-all">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="font-heading text-xl font-semibold text-text-primary">
                    Provide API Keys
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="focus-ring rounded-input p-1 text-text-muted hover:text-text-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="mb-6 text-sm text-text-muted">
                  Add header/env name and value. Redacted in logs; never stored.
                </p>

                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
                  {/* Secret Fields */}
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-1">
                            <Input
                              label="Name"
                              placeholder="Authorization"
                              {...register(`secrets.${index}.name`)}
                              error={errors.secrets?.[index]?.name?.message}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="relative">
                              <Input
                                label="Value"
                                type={showValues[index] ? "text" : "password"}
                                placeholder="Bearer ****************"
                                {...register(`secrets.${index}.value`)}
                                error={errors.secrets?.[index]?.value?.message}
                              />
                              <button
                                type="button"
                                onClick={() => toggleShowValue(index)}
                                className="absolute right-2 top-8 p-1 text-text-muted hover:text-text-primary"
                              >
                                {showValues[index] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="focus-ring mt-8 rounded-input p-2 text-text-muted hover:text-accent-red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Secret Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => append({ name: "", value: "" })}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Key
                  </Button>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      Inject for this run
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
