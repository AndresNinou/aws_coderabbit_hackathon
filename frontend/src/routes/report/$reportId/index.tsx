import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import VulnerabilityReport from "~/components/VulnerabilityReport";
import { extractReportFromAuditData } from "~/lib/vulnerabilityParser";
import toast from "react-hot-toast";

export const Route = createFileRoute("/report/$reportId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { reportId } = Route.useParams();
  const [inspectData, setInspectData] = useState<any>(null);
  const [auditData, setAuditData] = useState<string | string[]>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize report data computation to prevent unnecessary re-renders
  const reportData = useMemo(() => {
    if (auditData && auditData.length > 0) {
      console.log("Processing auditData:", auditData);
      console.log("auditData type:", typeof auditData);
      console.log("auditData length:", auditData.length);
      const result = extractReportFromAuditData(auditData);
      console.log("Extracted reportData:", result);
      console.log(
        "riskScore:",
        result?.riskScore,
        "maxScore:",
        result?.maxScore,
      );
      return result;
    }
    return null;
  }, [auditData]);

  // Memoize streaming function to prevent recreation
  const startStreaming = useCallback(async () => {
    if (isStreaming) return;

    // Cancel any existing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/audit/${reportId}`, {
        signal: abortController.signal,
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "inspect") {
                setInspectData(data.data);
                setProgress(25);
              } else if (data.type === "audit") {
                setAuditData(data.data);
                setProgress(75);
              } else if (data.type === "complete") {
                setProgress(100);
                setIsStreaming(false);
                toast.success("Security audit completed!");
                break;
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }

        chunkCount++;
        if (chunkCount % 10 === 0) {
          setProgress((prev) => Math.min(prev + 1, 90));
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Streaming was cancelled, this is expected
        console.log("Streaming cancelled");
      } else {
        console.error("Streaming error:", error);
        toast.error("Failed to load audit data");
      }
      setIsStreaming(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, [reportId, isStreaming]);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Load stored data on mount
  useEffect(() => {
    const stored = localStorage.getItem(`audit_${reportId}`);
    console.log(
      "Loading stored data for reportId:",
      reportId,
      "stored:",
      stored,
    );
    if (stored) {
      try {
        const { inspect, audit } = JSON.parse(stored);
        console.log(
          "Loaded from localStorage - inspect:",
          inspect,
          "audit:",
          audit,
        );
        setInspectData(inspect);
        setAuditData(audit);
      } catch (e) {
        console.error("Failed to parse stored data:", e);
      }
    } else {
      console.log("No stored data found for reportId:", reportId);
      // Don't start streaming - data should be loaded from backend manually
    }
  }, [reportId]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (inspectData && auditData) {
      localStorage.setItem(
        `audit_${reportId}`,
        JSON.stringify({
          inspect: inspectData,
          audit: auditData,
        }),
      );
    }
  }, [reportId, inspectData, auditData]);

  if (!reportData && !isStreaming) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            No Report Data Found
          </h2>
          <p className="mb-4 text-text-muted">
            Security audit data for report ID{" "}
            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
              {reportId}
            </code>{" "}
            was not found.
          </p>
          <p className="text-sm text-text-muted">
            Run the security audit first using the backend API, then refresh
            this page to view the results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {reportData && <VulnerabilityReport data={reportData} />}
    </div>
  );
}
