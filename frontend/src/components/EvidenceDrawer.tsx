import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/Button";

interface Finding {
  id: string;
  tag: string;
  severity: "HIGH" | "MED" | "LOW";
  description: string;
  evidence: {
    request: string;
    response: string;
    explanation: string;
  };
}

interface EvidenceDrawerProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({
  finding,
  isOpen,
  onClose,
}: EvidenceDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "text-accent-red";
      case "MED":
        return "text-accent-amber";
      case "LOW":
        return "text-accent-mint";
      default:
        return "text-text-muted";
    }
  };

  if (!finding) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bg-base/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll border-l border-stroke bg-bg-elev shadow-ambient">
                    {/* Header */}
                    <div className="border-b border-stroke bg-bg-base px-6 py-4">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="font-heading text-lg font-semibold text-text-primary">
                          Evidence: {finding.tag}{" "}
                          <span
                            className={`${getSeverityColor(finding.severity)}`}
                          >
                            ({finding.severity})
                          </span>
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="focus-ring rounded-input p-1 text-text-muted hover:text-text-primary"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6 px-6 py-6">
                      {/* Request */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-text-primary">
                            Request
                          </h3>
                          <button
                            onClick={() =>
                              handleCopy(finding.evidence.request, "request")
                            }
                            className="flex items-center space-x-1 text-xs text-text-muted transition-colors hover:text-text-primary"
                          >
                            {copiedField === "request" ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-input border border-stroke bg-bg-base p-4 font-mono text-sm text-text-primary">
                          {finding.evidence.request}
                        </pre>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-text-primary">
                            Response
                          </h3>
                          <button
                            onClick={() =>
                              handleCopy(finding.evidence.response, "response")
                            }
                            className="flex items-center space-x-1 text-xs text-text-muted transition-colors hover:text-text-primary"
                          >
                            {copiedField === "response" ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-input border border-stroke bg-bg-base p-4 font-mono text-sm text-text-primary">
                          {finding.evidence.response}
                        </pre>
                      </div>

                      {/* Explanation */}
                      <div>
                        <h3 className="mb-3 text-sm font-medium text-text-primary">
                          Why this matters
                        </h3>
                        <div className="rounded-input border border-accent-blue/20 bg-accent-blue/10 p-4">
                          <p className="text-sm leading-relaxed text-text-primary">
                            {finding.evidence.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-stroke bg-bg-base px-6 py-4">
                      <Button onClick={onClose} className="w-full">
                        Close
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
