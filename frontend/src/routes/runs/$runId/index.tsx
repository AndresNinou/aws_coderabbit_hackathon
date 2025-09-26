import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Clock,
  Activity,
  Shield,
  Search,
  AlertTriangle,
  Eye,
  Zap,
} from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";

export const Route = createFileRoute("/runs/$runId/")({
  validateSearch: z.object({
    target: z.string().optional(),
    type: z.enum(["url", "github"]).optional(),
    fix: z.string().optional(),
  }),
  component: RunProgress,
});

interface Tactic {
  id: string;
  name: string;
  description: string;
  techniques: Technique[];
  status: "completed" | "active" | "pending";
}

interface Technique {
  id: string;
  name: string;
  description: string;
  status: "completed" | "active" | "pending" | "checking";
}

function RunProgress() {
  const { runId } = Route.useParams();
  const search = useSearch({ from: "/runs/$runId/" });
  const [progress, setProgress] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [calls, setCalls] = useState(0);
  const [currentTacticIndex, setCurrentTacticIndex] = useState(0);
  const [currentTechniqueIndex, setCurrentTechniqueIndex] = useState(0);
  const [vulnerabilitiesFound, setVulnerabilitiesFound] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "🔍 Initializing SAFE-MCP vulnerability assessment...",
  ]);
  const [inspectData, setInspectData] = useState<any>(null);
  const [auditData, setAuditData] = useState<string[]>([]);

  const tactics: Tactic[] = [
    {
      id: "ATK-TA0043",
      name: "Reconnaissance",
      description: "Gathering information for future operations",
      status: "pending",
      techniques: [
        {
          id: "RECON-001",
          name: "MCP Server Enumeration",
          description: "Scanning for available MCP servers",
          status: "pending",
        },
        {
          id: "RECON-002",
          name: "Tool Discovery",
          description: "Mapping available tools and capabilities",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0042",
      name: "Resource Development",
      description: "Establishing resources for operations",
      status: "pending",
      techniques: [
        {
          id: "RESDEV-001",
          name: "Malicious Tool Creation",
          description: "Developing backdoored MCP tools",
          status: "pending",
        },
        {
          id: "RESDEV-002",
          name: "Infrastructure Setup",
          description: "Setting up attack infrastructure",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0001",
      name: "Initial Access",
      description: "Getting into MCP environment",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1001",
          name: "Tool Poisoning Attack (TPA)",
          description: "Malicious instructions in tool descriptions",
          status: "pending",
        },
        {
          id: "SAFE-T1002",
          name: "Supply Chain Compromise",
          description: "Backdoored MCP server packages",
          status: "pending",
        },
        {
          id: "SAFE-T1003",
          name: "Malicious MCP-Server Distribution",
          description: "Trojanized server packages",
          status: "pending",
        },
        {
          id: "SAFE-T1004",
          name: "Server Impersonation",
          description: "Name collision attacks",
          status: "pending",
        },
        {
          id: "SAFE-T1005",
          name: "Exposed Endpoint Exploit",
          description: "Misconfigured public endpoints",
          status: "pending",
        },
        {
          id: "SAFE-T1006",
          name: "User Social Engineering",
          description: "Phishing for tool installation",
          status: "pending",
        },
        {
          id: "SAFE-T1007",
          name: "OAuth Authorization Phishing",
          description: "Stealing OAuth tokens",
          status: "pending",
        },
        {
          id: "SAFE-T1008",
          name: "Authorization Server Mix-up",
          description: "Redirect to look-alike domains",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0002",
      name: "Execution",
      description: "Running malicious code via MCP",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1101",
          name: "Command Injection",
          description: "Unsanitized input exploitation",
          status: "pending",
        },
        {
          id: "SAFE-T1102",
          name: "Prompt Injection",
          description: "Malicious AI behavior manipulation",
          status: "pending",
        },
        {
          id: "SAFE-T1103",
          name: "Fake Tool Invocation",
          description: "Function spoofing attacks",
          status: "pending",
        },
        {
          id: "SAFE-T1104",
          name: "Over-Privileged Tool Abuse",
          description: "Abusing broad OS permissions",
          status: "pending",
        },
        {
          id: "SAFE-T1105",
          name: "Path Traversal via File Tool",
          description: "Directory traversal attacks",
          status: "pending",
        },
        {
          id: "SAFE-T1106",
          name: "Autonomous Loop Exploit",
          description: "Infinite loop DoS attacks",
          status: "pending",
        },
        {
          id: "SAFE-T1109",
          name: "Debugging Tool Exploitation",
          description: "MCP Inspector RCE vulnerabilities",
          status: "pending",
        },
        {
          id: "SAFE-T1110",
          name: "Multimodal Prompt Injection",
          description: "Image/audio-based prompt injection",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0003",
      name: "Persistence",
      description: "Maintaining foothold in MCP",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1201",
          name: "MCP Rug Pull Attack",
          description: "Time-delayed malicious changes",
          status: "pending",
        },
        {
          id: "SAFE-T1202",
          name: "OAuth Token Persistence",
          description: "Token theft and reuse",
          status: "pending",
        },
        {
          id: "SAFE-T1203",
          name: "Backdoored Server Binary",
          description: "Persistent backdoors in binaries",
          status: "pending",
        },
        {
          id: "SAFE-T1204",
          name: "Context Memory Implant",
          description: "Malicious vector store implants",
          status: "pending",
        },
        {
          id: "SAFE-T1205",
          name: "Persistent Tool Redefinition",
          description: "Hidden command persistence",
          status: "pending",
        },
        {
          id: "SAFE-T1206",
          name: "Credential Implant in Config",
          description: "API key implantation",
          status: "pending",
        },
        {
          id: "SAFE-T1207",
          name: "Hijack Update Mechanism",
          description: "Update channel compromise",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0004",
      name: "Privilege Escalation",
      description: "Gaining higher-level permissions",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1301",
          name: "Cross-Server Tool Shadowing",
          description: "Overriding legitimate tools",
          status: "pending",
        },
        {
          id: "SAFE-T1302",
          name: "High-Privilege Tool Abuse",
          description: "VM-level privilege abuse",
          status: "pending",
        },
        {
          id: "SAFE-T1303",
          name: "Sandbox Escape",
          description: "Container isolation bypass",
          status: "pending",
        },
        {
          id: "SAFE-T1304",
          name: "Credential Relay Chain",
          description: "Token escalation chains",
          status: "pending",
        },
        {
          id: "SAFE-T1305",
          name: "Host OS Privilege Escalation",
          description: "Root access exploitation",
          status: "pending",
        },
        {
          id: "SAFE-T1306",
          name: "Rogue Authorization Server",
          description: "OAuth flow manipulation",
          status: "pending",
        },
        {
          id: "SAFE-T1307",
          name: "Confused Deputy Attack",
          description: "Token forwarding exploitation",
          status: "pending",
        },
        {
          id: "SAFE-T1308",
          name: "Token Scope Substitution",
          description: "Scope escalation attacks",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0005",
      name: "Defense Evasion",
      description: "Avoiding detection",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1401",
          name: "Line Jumping",
          description: "Context injection bypasses",
          status: "pending",
        },
        {
          id: "SAFE-T1402",
          name: "Instruction Steganography",
          description: "Hidden directive embedding",
          status: "pending",
        },
        {
          id: "SAFE-T1403",
          name: "Consent-Fatigue Exploit",
          description: "User desensitization attacks",
          status: "pending",
        },
        {
          id: "SAFE-T1404",
          name: "Response Tampering",
          description: "Output manipulation",
          status: "pending",
        },
        {
          id: "SAFE-T1405",
          name: "Tool Obfuscation",
          description: "Malicious tool camouflage",
          status: "pending",
        },
        {
          id: "SAFE-T1406",
          name: "Metadata Manipulation",
          description: "Safety flag stripping",
          status: "pending",
        },
        {
          id: "SAFE-T1407",
          name: "Server Proxy Masquerade",
          description: "Traffic normalization",
          status: "pending",
        },
        {
          id: "SAFE-T1408",
          name: "OAuth Protocol Downgrade",
          description: "Security protocol weakening",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0006",
      name: "Credential Access",
      description: "Stealing credentials",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1501",
          name: "Full-Schema Poisoning",
          description: "Complete schema exploitation",
          status: "pending",
        },
        {
          id: "SAFE-T1502",
          name: "File-Based Credential Harvest",
          description: "SSH key and cloud credential theft",
          status: "pending",
        },
        {
          id: "SAFE-T1503",
          name: "Environment Variable Scraping",
          description: "API secret extraction",
          status: "pending",
        },
        {
          id: "SAFE-T1504",
          name: "Token Theft via API Response",
          description: "Session token leakage",
          status: "pending",
        },
        {
          id: "SAFE-T1505",
          name: "In-Memory Secret Extraction",
          description: "Vector store credential mining",
          status: "pending",
        },
        {
          id: "SAFE-T1506",
          name: "Infrastructure Token Theft",
          description: "OAuth token interception",
          status: "pending",
        },
        {
          id: "SAFE-T1507",
          name: "Authorization Code Interception",
          description: "OAuth code theft",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0007",
      name: "Discovery",
      description: "Environment reconnaissance",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1601",
          name: "MCP Server Enumeration",
          description: "Server and tool mapping",
          status: "pending",
        },
        {
          id: "SAFE-T1602",
          name: "Tool Enumeration",
          description: "Available function discovery",
          status: "pending",
        },
        {
          id: "SAFE-T1603",
          name: "System-Prompt Disclosure",
          description: "System prompt extraction",
          status: "pending",
        },
        {
          id: "SAFE-T1604",
          name: "Server Version Enumeration",
          description: "Vulnerable build identification",
          status: "pending",
        },
        {
          id: "SAFE-T1605",
          name: "Capability Mapping",
          description: "High-value tool identification",
          status: "pending",
        },
        {
          id: "SAFE-T1606",
          name: "Directory Listing",
          description: "Sensitive path discovery",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0008",
      name: "Lateral Movement",
      description: "Moving through environment",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1701",
          name: "Cross-Tool Contamination",
          description: "Service-to-service pivoting",
          status: "pending",
        },
        {
          id: "SAFE-T1702",
          name: "Shared-Memory Poisoning",
          description: "Vector DB task injection",
          status: "pending",
        },
        {
          id: "SAFE-T1703",
          name: "Tool-Chaining Pivot",
          description: "Privilege escalation chains",
          status: "pending",
        },
        {
          id: "SAFE-T1704",
          name: "Compromised-Server Pivot",
          description: "Workspace infection spread",
          status: "pending",
        },
        {
          id: "SAFE-T1705",
          name: "Cross-Agent Instruction Injection",
          description: "Multi-agent control seizure",
          status: "pending",
        },
        {
          id: "SAFE-T1706",
          name: "OAuth Token Pivot Replay",
          description: "Cross-service token abuse",
          status: "pending",
        },
        {
          id: "SAFE-T1707",
          name: "CSRF Token Relay",
          description: "Cross-resource access",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0009",
      name: "Collection",
      description: "Gathering data of interest",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1801",
          name: "Automated Data Harvesting",
          description: "Systematic data collection",
          status: "pending",
        },
        {
          id: "SAFE-T1802",
          name: "File Collection",
          description: "Sensitive file batch reading",
          status: "pending",
        },
        {
          id: "SAFE-T1803",
          name: "Database Dump",
          description: "Production database extraction",
          status: "pending",
        },
        {
          id: "SAFE-T1804",
          name: "API Data Harvest",
          description: "REST endpoint data mining",
          status: "pending",
        },
        {
          id: "SAFE-T1805",
          name: "Context Snapshot Capture",
          description: "Vector store data extraction",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0011",
      name: "Command and Control",
      description: "Communicating with compromised systems",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1901",
          name: "Outbound Webhook C2",
          description: "HTTP-based command channels",
          status: "pending",
        },
        {
          id: "SAFE-T1902",
          name: "Covert Channel in Responses",
          description: "Steganographic communication",
          status: "pending",
        },
        {
          id: "SAFE-T1903",
          name: "Malicious Server Control Channel",
          description: "Rogue server heartbeats",
          status: "pending",
        },
        {
          id: "SAFE-T1904",
          name: "Chat-Based Backchannel",
          description: "Encoded chat communication",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0010",
      name: "Exfiltration",
      description: "Stealing data",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T1910",
          name: "Covert Channel Exfiltration",
          description: "Data smuggling techniques",
          status: "pending",
        },
        {
          id: "SAFE-T1911",
          name: "Parameter Exfiltration",
          description: "JSON argument data hiding",
          status: "pending",
        },
        {
          id: "SAFE-T1912",
          name: "Steganographic Response Exfil",
          description: "Code block data hiding",
          status: "pending",
        },
        {
          id: "SAFE-T1913",
          name: "HTTP POST Exfiltration",
          description: "Direct web exfiltration",
          status: "pending",
        },
        {
          id: "SAFE-T1914",
          name: "Tool-to-Tool Exfiltration",
          description: "Multi-step data extraction",
          status: "pending",
        },
      ],
    },
    {
      id: "ATK-TA0040",
      name: "Impact",
      description: "System and data destruction",
      status: "pending",
      techniques: [
        {
          id: "SAFE-T2101",
          name: "Data Destruction",
          description: "File and database deletion",
          status: "pending",
        },
        {
          id: "SAFE-T2102",
          name: "Service Disruption",
          description: "API flooding and DoS",
          status: "pending",
        },
        {
          id: "SAFE-T2103",
          name: "Code Sabotage",
          description: "Malicious repository commits",
          status: "pending",
        },
        {
          id: "SAFE-T2104",
          name: "Fraudulent Transactions",
          description: "Financial system abuse",
          status: "pending",
        },
        {
          id: "SAFE-T2105",
          name: "Disinformation Output",
          description: "False content generation",
          status: "pending",
        },
      ],
    },
  ];

  const [tacticsState, setTacticsState] = useState<Tactic[]>(tactics);

  // Handle different scan types
  useEffect(() => {
    if (search.type === "url" && search.target) {
      const performUrlScan = async () => {
        try {
          setLogs((prev) => [
            ...prev,
            `📡 Inspecting MCP at ${search.target}...`,
          ]);

          // Detect if input is a command (contains spaces) or URL
          const isCommand = search.target && search.target.includes(" ");
          const requestBody = isCommand
            ? { command: search.target, timeout: 9999999 }
            : { url: search.target, timeout: 9999999 };

          const inspectRes = await fetch(
            "http://localhost:8000/api/v1/mcp/inspect",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              mode: "cors",
              body: JSON.stringify(requestBody),
            },
          );

          if (!inspectRes.ok) throw new Error("Inspect failed");

          const inspect = await inspectRes.json();
          setInspectData(inspect);
          setLogs((prev) => [
            ...prev,
            `✅ Inspected: ${inspect.tools.length} tools, ${inspect.resources.length} resources`,
          ]);
          setProgress(30);
          setCalls((prev) => prev + 1);

          const prompt = `please audit the next mcp server: ${JSON.stringify(inspect)}`;

          setLogs((prev) => [...prev, "🤖 Starting Claude audit..."]);

          const claudeRes = await fetch(
            "http://localhost:8000/api/v1/claude/query",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              mode: "cors",
              body: JSON.stringify({
                prompt,
                user_id: "default_user",
                options: {},
                session_id: runId,
                working_directory: "",
                create_directory: false,
              }),
            },
          );

          if (!claudeRes.ok) throw new Error("Audit failed");

          setLogs((prev) => [...prev, "📊 Processing audit stream..."]);
          setProgress(60);
          setCalls((prev) => prev + 1);

          // Read streaming NDJSON response
          const reader = claudeRes.body!.getReader();
          const decoder = new TextDecoder();
          let auditText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const msg = JSON.parse(line);
                  if (
                    msg.type === "assistant" &&
                    msg.content[0].type === "text"
                  ) {
                    auditText += msg.content[0].text + "\n";
                    setAuditData((prev) => [...prev, msg.content[0].text]);
                    setLogs((prev) => [
                      ...prev.slice(-5),
                      `📝 ${msg.content[0].text.substring(0, 50)}...`,
                    ]);
                    setProgress((prev) => Math.min(prev + 5, 100));
                  }
                } catch (e) {
                  console.error("Parse error:", e);
                }
              }
            }
          }

          setLogs((prev) => [...prev, "🏁 Audit complete!"]);
          setProgress(100);

          // Store data for report
          localStorage.setItem(
            `audit_${runId}`,
            JSON.stringify({
              inspect: inspect,
              audit: auditText,
            }),
          );

          setTimeout(() => {
            window.location.href = `/report/${runId}`;
          }, 2000);
        } catch (error) {
          toast.error(`Error: ${(error as Error).message}`);
          setLogs((prev) => [...prev, `❌ ${(error as Error).message}`]);
        }
      };

      performUrlScan();
    } else {
      // Existing simulation for github
      const interval = setInterval(() => {
        setCalls((prev) => prev + Math.floor(Math.random() * 3 + 1));

        setTacticsState((prev) => {
          // existing logic...
          return prev;
        });

        // existing progress calculation
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [search, runId]);

  // Auto-redirect for simulation
  useEffect(() => {
    if (progress >= 100 && search.type !== "url") {
      setTimeout(() => {
        window.location.href = `/report/${runId}`;
      }, 3000);
    }
  }, [progress, runId, search.type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTactic = tacticsState[currentTacticIndex];
  const currentTechnique = currentTactic?.techniques[currentTechniqueIndex];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-card border border-stroke bg-bg-elev p-8 shadow-ambient">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">
                SAFE-MCP Security Analysis
              </h1>
              <p className="mb-2 font-mono text-text-muted">
                Target:{" "}
                <span className="text-accent-gold">
                  {search.target || "mcp.example.com"}
                </span>
              </p>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>🎯 {tacticsState.length} MITRE ATT&CK Tactics</span>
                <span>
                  🔧{" "}
                  {tacticsState.reduce(
                    (sum, t) => sum + t.techniques.length,
                    0,
                  )}{" "}
                  Techniques
                </span>
                <span className="text-accent-red">
                  ⚠️ {vulnerabilitiesFound} Vulnerabilities Found
                </span>
              </div>
            </div>
          </div>

          {/* Current Analysis Status */}
          {currentTactic && currentTechnique && progress < 100 && (
            <div className="mb-8 rounded-input border-l-4 border-accent-mint bg-bg-base p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-accent-mint/20">
                  <Search className="h-4 w-4 text-accent-mint" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Currently Analyzing: {currentTactic.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {currentTactic.description}
                  </p>
                </div>
              </div>
              <div className="ml-11 rounded-input bg-stroke/30 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-accent-gold"></div>
                  <span className="font-mono text-sm text-accent-gold">
                    {currentTechnique.id}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {currentTechnique.name}
                  </span>
                </div>
                <p className="ml-4 text-xs text-text-muted">
                  {currentTechnique.description}
                </p>
                <div className="ml-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-mint border-t-transparent"></div>
                    <span className="text-xs text-accent-mint">
                      Scanning for vulnerabilities...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tactics Progress Grid */}
          <div className="mb-8">
            <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              MITRE ATT&CK Tactics Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tacticsState.map((tactic, index) => (
                <div
                  key={tactic.id}
                  className={`rounded-input border p-4 transition-all duration-300 ${
                    tactic.status === "completed"
                      ? "border-accent-mint bg-accent-mint/10"
                      : tactic.status === "active"
                        ? "animate-pulse-gold border-accent-gold bg-accent-gold/10 shadow-glow"
                        : "border-stroke bg-bg-base"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        tactic.status === "completed"
                          ? "bg-accent-mint"
                          : tactic.status === "active"
                            ? "animate-pulse bg-accent-gold"
                            : "bg-stroke"
                      }`}
                    ></div>
                    <span className="font-mono text-xs text-text-muted">
                      {tactic.id}
                    </span>
                  </div>
                  <h4
                    className={`mb-1 text-sm font-semibold ${
                      tactic.status === "active"
                        ? "text-accent-gold"
                        : "text-text-primary"
                    }`}
                  >
                    {tactic.name}
                  </h4>
                  <p className="mb-2 line-clamp-2 text-xs text-text-muted">
                    {tactic.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {
                        tactic.techniques.filter(
                          (t) => t.status === "completed",
                        ).length
                      }
                      /{tactic.techniques.length} techniques
                    </span>
                    {tactic.status === "active" && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-accent-gold"></div>
                        <span className="text-accent-gold">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">Overall Analysis Progress</span>
              <span className="font-mono text-text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-stroke">
              <div
                className="seam-loader h-full bg-grad-cta transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Metrics */}
          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Clock className="mr-2 h-5 w-5 text-accent-blue" />
                <span className="text-sm text-text-muted">Runtime</span>
              </div>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {formatTime(runtime)}
              </span>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Activity className="mr-2 h-5 w-5 text-accent-mint" />
                <span className="text-sm text-text-muted">API Calls</span>
              </div>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {calls}
              </span>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-accent-red" />
                <span className="text-sm text-text-muted">Vulnerabilities</span>
              </div>
              <span className="font-mono text-xl font-semibold text-accent-red">
                {vulnerabilitiesFound}
              </span>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Shield className="mr-2 h-5 w-5 text-accent-amber" />
                <span className="text-sm text-text-muted">Secrets Used</span>
              </div>
              <span className="font-mono text-xl font-semibold text-accent-amber">
                YES
              </span>
            </div>
          </div>

          {/* Enhanced Live Logs */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
              <Eye className="h-5 w-5" />
              Analysis Log (Real-time)
            </h3>
            <div className="analysis-logs max-h-64 space-y-2 overflow-y-auto rounded-input border bg-bg-base p-4 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`transition-all duration-300 ${
                    index === logs.length - 1
                      ? "animate-pulse text-accent-mint"
                      : "text-text-muted"
                  }`}
                >
                  <span className="mr-2 text-accent-blue">
                    [{formatTime(runtime)}]
                  </span>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Auto-redirect notice */}
          {progress >= 100 &&
            (search.type === "url" ? (
              <div className="mt-6">
                <h3 className="mb-4 font-heading text-lg font-semibold">
                  Audit Results
                </h3>
                <div className="space-y-4">
                  {auditData.map((chunk) => (
                    <div
                      key={chunk}
                      className="rounded-input border border-stroke bg-bg-base p-4"
                    >
                      {chunk}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-input border border-accent-mint bg-accent-mint/10 p-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-accent-mint" />
                  <p className="font-medium text-accent-mint">
                    SAFE-MCP vulnerability assessment completed!
                  </p>
                </div>
                <p className="text-sm text-text-muted">
                  Found {vulnerabilitiesFound} potential vulnerabilities.
                  Generating detailed report...
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
