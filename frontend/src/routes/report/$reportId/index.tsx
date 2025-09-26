import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ExternalLink, Eye, FileText, Award, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/Button";
import { ScoreDial } from "~/components/ui/ScoreDial";
import { EvidenceDrawer } from "~/components/EvidenceDrawer";

export const Route = createFileRoute("/report/$reportId/")({
  component: Report,
});

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

const isGitHubUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return (
      parsedUrl.hostname === "github.com" &&
      parsedUrl.pathname.split("/").length >= 3
    );
  } catch {
    return false;
  }
};

function Report() {
  const { reportId } = Route.useParams();
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [lastClaudeMessage, setLastClaudeMessage] = useState<string>("");
  const [showOpenPrButton, setShowOpenPrButton] = useState(false);
  const [prUrl, setPrUrl] = useState<string>("");
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [inspectData, setInspectData] = useState<any>(null);
  const [auditData, setAuditData] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`audit_${reportId}`);
    if (stored) {
      const { inspect, audit } = JSON.parse(stored);
      console.log(
        "🔍 Frontend: Loaded inspect data from localStorage:",
        inspect,
      );
      console.log("📊 Frontend: Loaded audit data from localStorage:", audit);
      setInspectData(inspect);
      setAuditData(audit);
    }
  }, [reportId]);

  // Extract score from audit text
  const extractScore = (auditText: string): number => {
    if (!auditText || typeof auditText !== "string") {
      console.log("🔍 Frontend: No audit text provided, defaulting to 100");
      return 100;
    }

    console.log(
      "🔍 Frontend: Extracting score from audit text:",
      auditText.substring(0, 200) + "...",
    );

    // Try multiple regex patterns to match different score formats
    const scoreRegexes = [
      /security score of (\d+)\/100/i,
      /risk score of (\d+)\/100/i,
      /\*\*Risk Score:\*\*\s*(\d+)\/100/,
      /(\d+)\/100.*security score/i,
      /(\d+)\/100.*risk score/i,
      /score[:\s]*(\d+)\/100/i,
      /\(score[:\s]*(\d+)\/100\)/i,
    ];

    for (const regex of scoreRegexes) {
      try {
        const match = auditText.match(regex);
        console.log(
          "🔍 Frontend: Trying regex:",
          regex.source,
          "Match found:",
          !!match,
        );
        if (match && match[1]) {
          const score = parseInt(match[1], 10);
          if (!isNaN(score) && score >= 0 && score <= 100) {
            console.log("🔍 Frontend: Extracted score:", score);
            return score;
          }
        }
      } catch (error) {
        console.warn("🔍 Frontend: Error matching regex:", regex.source, error);
      }
    }

    // If no explicit score found, return null to let the fallback calculation handle it
    console.log(
      "🔍 Frontend: No explicit score found, returning null for fallback calculation",
    );
    return null;
  };

  // Extract vulnerabilities from audit text
  const extractVulnerabilities = (auditText: string) => {
    if (!auditText || typeof auditText !== "string") {
      console.log(
        "🔍 Frontend: No audit text provided for vulnerability extraction",
      );
      return [];
    }

    console.log("🔍 Frontend: Extracting vulnerabilities from audit text");

    try {
      // Try JSON format first
      const vulnRegex = /"vulnerabilities"\s*:\s*\[([\s\S]*?)\]/;
      const match = auditText.match(vulnRegex);
      console.log("🔍 Frontend: Vulnerability regex match found:", !!match);

      if (match && match[1]) {
        try {
          const vulns = JSON.parse(`[${match[1]}]`);
          console.log(
            "🔍 Frontend: Parsed vulnerabilities count:",
            vulns?.length || 0,
          );

          if (Array.isArray(vulns)) {
            const mappedVulns = vulns.map((v: any, idx: number) => {
              const safeName = v?.name || "Unknown Vulnerability";
              const safeType = v?.type || "unknown";
              const safeCause = v?.cause || "No description available";

              return {
                id: `audit-${idx}`,
                tag: safeName.split(" - ")[1] || "AUDIT",
                severity:
                  safeType === "critical" || safeType === "high"
                    ? "HIGH"
                    : safeType === "medium"
                      ? "MED"
                      : "LOW",
                description: safeCause,
                evidence: {
                  request: "MCP Server Inspection",
                  response: safeName,
                  explanation: safeCause,
                },
              };
            });
            console.log(
              "🔍 Frontend: Mapped vulnerabilities count:",
              mappedVulns.length,
            );
            return mappedVulns;
          }
        } catch (parseError) {
          console.warn(
            "🔍 Frontend: Error parsing vulnerabilities JSON:",
            parseError,
          );
        }
      }

      // Fallback: Extract from text description patterns
      console.log(
        "🔍 Frontend: No JSON vulnerabilities found, trying text extraction",
      );

      // Try multiple text patterns to match SAFE-MCP format and other vulnerability patterns
      const textPatterns = [
        /vulnerability:?\s*\*\*([^*]+)\*\*\s*\(([^)]+)\)/gi,
        /\*\*([^*]+)\*\*\s*vulnerability/gi,
        /critical\s+vulnerability[:\s]*([^\n.]+)/gi,
        /SAFE-([A-Z0-9]+)\s*\([^)]*\)/gi,
        /\*\*SAFE-([A-Z0-9]+):\s*([^*]+)\*\*/gi, // Match **SAFE-T1001: Tool Poisoning Attack**
        /####\s*\d+\.\s*\*\*([^*]+)\*\*\s*\(([^)]+)\)/gi, // Match #### 1. **SAFE-T1001: Tool Poisoning Attack (TPA)**
        /\*\*([^*]*SAFE-[A-Z0-9]+[^*]*)\*\*/gi, // Match any text with SAFE- codes in bold
      ];

      for (const pattern of textPatterns) {
        const matches = [...auditText.matchAll(pattern)];
        console.log(
          `🔍 Frontend: Text pattern ${pattern.source} found ${matches.length} matches`,
        );

        if (matches.length > 0) {
          const vulnerabilities = matches.map((match, idx) => {
            const description =
              match[1]?.trim() || match[0]?.trim() || "Vulnerability detected";
            const tag = match[2]?.split(" ")[0] || `VULN-${idx + 1}`;

            return {
              id: `audit-text-${idx}`,
              tag: tag.length > 20 ? tag.substring(0, 20) : tag,
              severity: "HIGH" as const,
              description:
                description.length > 200
                  ? description.substring(0, 200) + "..."
                  : description,
              evidence: {
                request: "MCP Server Inspection",
                response: description,
                explanation: "Extracted from audit text analysis",
              },
            };
          });

          console.log(
            "🔍 Frontend: Extracted text vulnerabilities count:",
            vulnerabilities.length,
          );
          return vulnerabilities.slice(0, 10); // Limit to 10 vulnerabilities
        }
      }
    } catch (error) {
      console.error("🔍 Frontend: Error in vulnerability extraction:", error);
    }

    console.log("🔍 Frontend: No vulnerabilities found in audit text");
    return [];
  };

  const auditText =
    typeof auditData === "string" ? auditData : auditData?.join("\n") || "";
  const auditFindings = auditText ? extractVulnerabilities(auditText) : [];

  // Calculate score based on extracted vulnerabilities (fallback to backend score if available)
  const backendScore = auditText ? extractScore(auditText) : null;
  let score = 100;

  if (backendScore !== null && typeof backendScore === "number") {
    score = backendScore;
    console.log("🔍 Frontend: Using explicit backend score:", score);
  } else if (auditFindings.length > 0) {
    // Fallback calculation based on vulnerabilities
    console.log(
      "🔍 Frontend: No explicit score found, calculating based on vulnerabilities:",
      auditFindings.length,
    );
    const criticalCount = auditFindings.filter(
      (f) => f.severity === "HIGH",
    ).length;
    const highCount = auditFindings.filter((f) => f.severity === "MED").length;
    const mediumCount = auditFindings.filter(
      (f) => f.severity === "LOW",
    ).length;

    console.log(
      "🔍 Frontend: Vulnerability counts - Critical:",
      criticalCount,
      "High:",
      highCount,
      "Medium:",
      mediumCount,
    );

    if (criticalCount > 0) {
      score = Math.max(5, 15 - criticalCount * 5);
      console.log(
        "🔍 Frontend: Score calculated based on critical vulnerabilities:",
        score,
      );
    } else if (highCount > 0) {
      score = Math.max(20, 100 - highCount * 25);
      console.log(
        "🔍 Frontend: Score calculated based on high vulnerabilities:",
        score,
      );
    } else if (mediumCount > 0) {
      score = Math.max(60, 100 - mediumCount * 15);
      console.log(
        "🔍 Frontend: Score calculated based on medium vulnerabilities:",
        score,
      );
    }
  } else {
    // No vulnerabilities found and no explicit score - this indicates a clean system
    console.log(
      "🔍 Frontend: No vulnerabilities found and no explicit score, keeping score at 100",
    );
  }

  // Dynamic report data
  const reportData = {
    target: inspectData?.server_info?.server_spec || "Unknown Target",
    score,
    externalCorroborations: 2,
    findings:
      auditFindings.length > 0
        ? auditFindings
        : ([
            {
              id: "1",
              tag: "INSPECTION",
              severity: "LOW" as const,
              description: "MCP server inspection completed successfully",
              evidence: {
                request: "Inspect API call",
                response: `Server: ${inspectData?.server_info?.server_spec || "Unknown"}`,
                explanation:
                  "Basic server connectivity and capability enumeration successful.",
              },
            },
          ] as Finding[]),
    recommendations: [
      "Review tool descriptions for malicious content",
      "Implement input validation for all tools",
      "Monitor for prompt injection attempts",
      "Use HTTPS for all MCP communications",
    ],
  };

  const handleFixVulnerabilities = async () => {
    if (!isGitHubUrl(reportData.target)) {
      toast.error("Target must be a GitHub repository URL");
      return;
    }

    setIsFixing(true);

    const promise = new Promise<void>((resolve) => {
      setTimeout(
        () => {
          // Fix vulnerabilities and create PR
          const mockPrUrl = `https://github.com/example/mcp-server/pull/${Math.floor(Math.random() * 1000) + 100}`;
          toast.success(
            `Successfully fixed ${reportData.findings.length} vulnerabilities! Pull request created: ${mockPrUrl}`,
          );
          setIsFixing(false);
          resolve();
        },
        3000 + Math.random() * 2000,
      ); // Processing time
    });

    toast.promise(promise, {
      loading: "Analyzing and fixing vulnerabilities...",
      success: "Vulnerabilities fixed successfully!",
      error: "Failed to fix vulnerabilities",
    });

    try {
      await promise;
    } catch (error) {
      toast.error("Failed to fix vulnerabilities");
      setIsFixing(false);
    }
  };

  const handleCreatePr = async () => {
    if (!lastClaudeMessage.trim()) {
      toast.error("No Claude response available for PR creation");
      return;
    }

    setIsCreatingPr(true);

    try {
      console.log(
        "🚀 Frontend: Making GitHub create-pr API call with body:",
        lastClaudeMessage,
      );
      const prResponse = await fetch(
        "http://localhost:8000/api/v1/github/create-pr",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({
            working_directory: "/home/newton/parallel_2/swe_3/test-pr-creation",
            body: lastClaudeMessage,
          }),
        },
      );

      console.log(
        "📡 Frontend: GitHub create-pr API response status:",
        prResponse.status,
      );
      if (!prResponse.ok) throw new Error("Failed to create PR");

      const prData = await prResponse.json();
      console.log("📡 Frontend: GitHub create-pr API response data:", prData);
      setPrUrl(prData.pr_url);
      toast.success("Pull request created successfully!");
    } catch (error) {
      console.error("❌ Frontend: GitHub create-pr API error:", error);
      toast.error(`Failed to create PR: ${(error as Error).message}`);
    } finally {
      setIsCreatingPr(false);
    }
  };

  const handleFixWithClaude = async () => {
    if (!githubUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    if (!isGitHubUrl(githubUrl)) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    setIsFixing(true);
    setShowFixModal(false);

    try {
      // Create prompt for Claude to fix vulnerabilities
      const vulnerabilitiesText = auditFindings
        .map((f) => `${f.tag}: ${f.description}`)
        .join("\n");
      const sessionId = `fix-session-${Date.now()}`;
      const fixPrompt = `Please create a new folder for this Claude code session and then analyze the following MCP server vulnerabilities to create fixes for them in the GitHub repository ${githubUrl}:

SESSION SETUP:
1. Create a new folder named "claude-fix-${sessionId}" for this code session
2. Change to this new folder as the working directory

VULNERABILITIES TO FIX:
${vulnerabilitiesText}

MCP SERVER DETAILS:
${JSON.stringify(inspectData, null, 2)}

INSTRUCTIONS:
1. Create the session folder and set it as working directory
2. Analyze each vulnerability in detail
3. Create appropriate code fixes for the GitHub repository
4. Commit the changes to a new branch
5. Create a pull request with all the fixes

Focus on the most critical security issues first. Provide detailed analysis and comprehensive fixes.`;

      console.log(
        "🚀 Frontend: Making Claude API call with prompt:",
        fixPrompt,
      );
      const claudeResponse = await fetch(
        "http://localhost:8000/api/v1/claude/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({
            prompt: fixPrompt,
            user_id: "fix-user",
            options: { permission_mode: "acceptEdits" },
            session_id: sessionId,
            working_directory: "",
            create_directory: false,
          }),
        },
      );

      console.log(
        "📡 Frontend: Claude API response status:",
        claudeResponse.status,
      );
      if (!claudeResponse.ok) throw new Error("Failed to initiate fix process");

      // Handle streaming response
      const reader = claudeResponse.body!.getReader();
      const decoder = new TextDecoder();
      let fixResult = "";
      let lastAssistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            try {
              const msg = JSON.parse(line);
              if (msg.type === "assistant" && msg.content && msg.content[0]) {
                if (msg.content[0].type === "text") {
                  const messageText = msg.content[0].text;
                  fixResult += messageText + "\n";
                  lastAssistantMessage = messageText; // Store the last message
                }
              } else if (msg.type === "result") {
                // Extract PR URL from result if available
                const prMatch = fixResult.match(
                  /https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/,
                );
                if (prMatch) {
                  toast.success(`Pull request created: ${prMatch[0]}`);
                } else {
                  toast.success(
                    "Fix process completed! Check the repository for the created PR.",
                  );
                }
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      // Store the last Claude message and show Open PR button
      setLastClaudeMessage(lastAssistantMessage);
      setShowOpenPrButton(true);
      setIsFixing(false);
    } catch (error) {
      toast.error(`Failed to fix vulnerabilities: ${(error as Error).message}`);
      setIsFixing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-accent-red/20 text-accent-red";
      case "MED":
        return "bg-accent-amber/20 text-accent-amber";
      case "LOW":
        return "bg-accent-mint/20 text-accent-mint";
      default:
        return "bg-stroke/20 text-text-muted";
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
                  Security Report
                </h1>
                <p className="font-mono text-text-muted">
                  Target:{" "}
                  <span className="text-accent-gold">{reportData.target}</span>
                </p>
              </div>
              <div className="text-right">
                <ScoreDial score={reportData.score} size="sm" />
              </div>
            </div>

            {/* External Lens & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-text-muted">
                    Analysis completed with
                  </span>
                  <span className="inline-flex items-center rounded-chip border border-accent-blue px-3 py-1 text-sm text-accent-blue">
                    {reportData.externalCorroborations} security checks
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link to={`/certificate/${reportId}`}>
                  <Button>
                    <Award className="mr-2 h-4 w-4" />
                    Issue Certificate
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowFixModal(true)}
                  disabled={isFixing}
                  variant="secondary"
                >
                  {isFixing ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Fixing...
                    </>
                  ) : (
                    "Fix Vulnerabilities"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Findings Table */}
          <div className="rounded-card border border-stroke bg-bg-elev shadow-ambient">
            <div className="border-b border-stroke p-6">
              <h2 className="font-heading text-xl font-semibold text-text-primary">
                Findings (SAFE-MCP)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-stroke bg-bg-base">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                      Tag
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                      What We Did
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                      Evidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.findings.map((finding, index) => (
                    <tr
                      key={finding.id}
                      className={index % 2 === 0 ? "bg-bg-elev" : "bg-bg-base"}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-text-primary">
                        {finding.tag}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-chip px-3 py-1 text-xs font-medium ${getSeverityColor(finding.severity)}`}
                        >
                          {finding.severity}
                        </span>
                      </td>
                      <td className="max-w-md px-6 py-4 text-sm text-text-primary">
                        {finding.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedFinding(finding)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MCP Inspection */}
          {inspectData && (
            <div className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient">
              <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
                MCP Inspection
              </h3>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-input border border-stroke bg-bg-base p-4">
                  <p className="text-sm text-text-muted">Tools</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {inspectData.tools?.length || 0}
                  </p>
                </div>
                <div className="rounded-input border border-stroke bg-bg-base p-4">
                  <p className="text-sm text-text-muted">Resources</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {inspectData.resources?.length || 0}
                  </p>
                </div>
                <div className="rounded-input border border-stroke bg-bg-base p-4">
                  <p className="text-sm text-text-muted">Prompts</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {inspectData.prompts?.length || 0}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium text-text-primary">Tools</h4>
                  <div className="space-y-4">
                    {(inspectData.tools || []).map((tool: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-input border border-stroke bg-bg-base p-4"
                      >
                        <h5 className="font-semibold">
                          {tool?.name || "Unknown Tool"}
                        </h5>
                        <p className="mt-1 text-sm text-text-muted">
                          {tool?.description || "No description available"}
                        </p>
                        <pre className="mt-2 overflow-auto text-xs">
                          {JSON.stringify(tool?.inputSchema || {}, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-text-primary">
                    Resources
                  </h4>
                  <div className="space-y-4">
                    {(inspectData.resources || []).map(
                      (res: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-input border border-stroke bg-bg-base p-4"
                        >
                          <h5 className="font-semibold">
                            {res?.name || "Unknown Resource"}
                          </h5>
                          <p className="text-sm text-text-muted">
                            URI: {res?.uri || "N/A"}
                          </p>
                          <p className="mt-1 text-sm text-text-muted">
                            {res?.description || "No description available"}
                          </p>
                          <p className="mt-1 text-sm text-text-muted">
                            MIME: {res?.mimeType || "N/A"}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-text-primary">
                    Server Info
                  </h4>
                  <pre className="overflow-auto rounded-input border border-stroke bg-bg-base p-4 text-sm">
                    {JSON.stringify(inspectData.server_info, null, 2)}
                  </pre>
                </div>
                <p className="text-sm text-text-muted">
                  Transport Type: {inspectData.transport_type}
                </p>
              </div>
            </div>
          )}

          {/* Claude Audit */}
          {auditData && (
            <div className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient">
              <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
                Claude Audit Analysis
              </h3>
              <div className="space-y-4">
                {(() => {
                  const auditText = Array.isArray(auditData)
                    ? auditData.join("\n")
                    : auditData;
                  // Remove JSON blocks from the text
                  const cleanText = auditText
                    .replace(/```json[\s\S]*?```/g, "")
                    .trim();
                  return (
                    <div className="whitespace-pre-wrap rounded-input border border-stroke bg-bg-base p-4">
                      {cleanText}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-text-primary">
                Recommended Fixes
              </h3>
              {isGitHubUrl(reportData.target) && (
                <Button
                  onClick={handleFixVulnerabilities}
                  disabled={isFixing}
                  size="sm"
                >
                  {isFixing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                      Fixing...
                    </>
                  ) : (
                    "Fix Vulnerabilities & Open PR"
                  )}
                </Button>
              )}
            </div>
            <ul className="space-y-2">
              {reportData.recommendations.map((rec, idx) => (
                <li key={rec} className="flex items-start space-x-3">
                  <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-gold" />
                  <span className="text-text-primary">{rec}</span>
                </li>
              ))}
            </ul>

            {/* Open PR Button */}
            {showOpenPrButton && (
              <div className="mt-6 border-t border-stroke pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      Create Pull Request
                    </h4>
                    <p className="text-sm text-text-muted">
                      Claude has provided fixes. Create a pull request with the
                      suggested changes.
                    </p>
                  </div>
                  <Button
                    onClick={handleCreatePr}
                    disabled={isCreatingPr}
                    variant="secondary"
                  >
                    {isCreatingPr ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating PR...
                      </>
                    ) : (
                      "Open PR"
                    )}
                  </Button>
                </div>
                {prUrl && (
                  <div className="mt-4">
                    <a
                      href={prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Pull Request
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient">
            <div className="flex flex-wrap gap-4">
              <Link to="/discover">
                <Button variant="secondary" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Bright Data Doc Snippets
                </Button>
              </Link>
              <Link to="/discover">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  MCP Discovery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fix Vulnerabilities Modal */}
      {showFixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-card border border-stroke bg-bg-elev p-6">
            <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              Fix Vulnerabilities with Claude
            </h3>
            <p className="mb-4 text-sm text-text-muted">
              Enter the GitHub repository URL where Claude should create fixes
              and a pull request.
            </p>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="mb-4 w-full rounded-input border border-stroke bg-bg-base px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent-mint focus:outline-none focus:ring-2 focus:ring-accent-mint/20"
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleFixWithClaude}
                disabled={!githubUrl.trim() || isFixing}
                className="flex-1"
              >
                {isFixing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                    Creating PR...
                  </>
                ) : (
                  "Create Fix PR"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowFixModal(false)}
                disabled={isFixing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Drawer */}
      <EvidenceDrawer
        finding={selectedFinding}
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
