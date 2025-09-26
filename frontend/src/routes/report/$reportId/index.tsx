import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const [reportData, setReportData] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);

  // Memoize streaming function to prevent recreation
  const startStreaming = useCallback(async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/audit/${reportId}`);
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
      console.error("Streaming error:", error);
      toast.error("Failed to load audit data");
      setIsStreaming(false);
    }
  }, [reportId, isStreaming]);

  // Load stored data on mount
  useEffect(() => {
    const stored = localStorage.getItem(`audit_${reportId}`);
    if (stored) {
      const { inspect, audit } = JSON.parse(stored);
      setInspectData(inspect);
      setAuditData(audit);
    } else {
      // If no stored data, start streaming
      startStreaming();
    }
  }, [reportId]); // Removed startStreaming to prevent infinite loop

  // Process audit data into report format
  useEffect(() => {
    if (auditData) {
      const parsedReport = extractReportFromAuditData(auditData);
      if (parsedReport) {
        setReportData(parsedReport);
      }
    }
  }, [auditData]);

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
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-gold"></div>
          <p className="text-text-muted">Loading security report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <VulnerabilityReport data={reportData} />
    </div>
  );
}
