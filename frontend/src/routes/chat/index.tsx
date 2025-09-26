import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/Button";

export const Route = createFileRoute("/chat/")({
  component: Chat,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Simulated responses from Hermes
const getHermesResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (
    lowerMessage.includes("mcp") ||
    lowerMessage.includes("model context protocol")
  ) {
    return "MCP (Model Context Protocol) is a standardized way for AI assistants to securely connect to external data sources and tools. Key security considerations include:\n\n• **Input validation** - Always validate and sanitize inputs from MCP servers\n• **Authentication** - Use proper OAuth flows and token management\n• **Tool permissions** - Implement least-privilege access for MCP tools\n• **Data isolation** - Keep different MCP sessions properly isolated\n\nWhat specific aspect of MCP security would you like to explore?";
  }

  if (lowerMessage.includes("vulnerability") || lowerMessage.includes("vuln")) {
    return "I can help you understand various vulnerability types in MCP environments:\n\n• **Tool poisoning** - When malicious tools are injected into the MCP ecosystem\n• **Prompt injection** - Attempts to manipulate AI behavior through crafted inputs\n• **Data leakage** - Unintended exposure of sensitive information\n• **Authentication bypass** - Circumventing security controls\n• **Input validation flaws** - Missing or weak input sanitization\n\nWhich vulnerability type interests you most? I can provide detailed mitigation strategies.";
  }

  if (lowerMessage.includes("safe-mcp") || lowerMessage.includes("safe mcp")) {
    return "SAFE-MCP is our comprehensive security framework for Model Context Protocol implementations. It includes:\n\n**Core Principles:**\n• Strict input validation and schema enforcement\n• Mandatory HTTPS for all communications\n• Proper authentication and authorization\n• Comprehensive logging and monitoring\n\n**Testing Categories:**\n• INPUT_STRICTNESS - Rejecting malformed/unknown fields\n• AUTH/TLS - Enforcing secure connections\n• PERMISSION_SCOPE - Validating access controls\n• DATA_ISOLATION - Preventing cross-session leaks\n\nWould you like me to dive deeper into any specific SAFE-MCP component?";
  }

  if (
    lowerMessage.includes("github") ||
    lowerMessage.includes("repository") ||
    lowerMessage.includes("repo")
  ) {
    return "When analyzing GitHub repositories for MCP security, I focus on:\n\n**Code Analysis:**\n• Server implementation patterns\n• Authentication mechanisms\n• Input validation routines\n• Error handling practices\n\n**Configuration Review:**\n• Environment variable usage\n• Dependency security\n• Build pipeline security\n• Access control settings\n\n**Common Issues:**\n• Hardcoded secrets\n• Insufficient input validation\n• Missing rate limiting\n• Insecure defaults\n\nDo you have a specific repository or security concern you'd like me to help with?";
  }

  if (
    lowerMessage.includes("fix") ||
    lowerMessage.includes("remediation") ||
    lowerMessage.includes("patch")
  ) {
    return "For vulnerability remediation in MCP systems, I recommend a systematic approach:\n\n**1. Prioritize by Risk**\n• HIGH severity: Immediate action required\n• MEDIUM: Address within sprint cycle\n• LOW: Include in next major release\n\n**2. Common Fixes**\n• Add input validation with Zod schemas\n• Implement proper error handling\n• Upgrade to HTTPS-only communications\n• Add rate limiting and authentication\n\n**3. Testing Strategy**\n• Unit tests for validation logic\n• Integration tests for security flows\n• Penetration testing for edge cases\n\nWhat type of vulnerability are you looking to fix?";
  }

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("help")
  ) {
    return "Hello! I'm Hermes, your MCP security expert. I specialize in:\n\n• **SAFE-MCP framework** implementation and testing\n• **Vulnerability assessment** for MCP servers and clients\n• **Security best practices** for Model Context Protocol\n• **Code review** for security issues\n• **Remediation strategies** for common vulnerabilities\n\nI can help you understand security concepts, analyze potential vulnerabilities, or provide guidance on secure MCP implementations. What security topic would you like to explore?";
  }

  // Default response
  return "That's an interesting question about MCP security. While I specialize in areas like SAFE-MCP framework, vulnerability analysis, and secure implementation practices, I'd be happy to help you explore this topic further.\n\nCould you provide more context about what specific security aspect you're interested in? For example:\n• Vulnerability assessment and remediation\n• Secure coding practices for MCP\n• Authentication and authorization\n• Input validation and sanitization\n• Tool security and permissions\n\nI'm here to help make your MCP implementations more secure!";
};

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Hermes, your MCP security expert. I can help you understand vulnerabilities, analyze security issues, and provide guidance on secure MCP implementations. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (content: string, messageId: string) => {
    const words = content.split(" ");
    let currentContent = "";

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? " " : "") + words[i];

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: currentContent } : msg,
        ),
      );

      // Simulate typing delay
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100),
      );
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    // Prepare assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Simulate thinking delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000),
      );

      // Get simulated response
      const response = getHermesResponse(currentInput);

      // Simulate typing
      await simulateTyping(response, assistantMessageId);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <div className="mx-auto flex max-w-4xl flex-1 flex-col px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
            Chat with Hermes
          </h1>
          <p className="text-text-muted">Your MCP security expert assistant</p>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-card border border-stroke bg-bg-elev shadow-ambient">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-accent-blue text-bg-base"
                      : "bg-accent-gold text-bg-base"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block max-w-3xl rounded-input p-4 ${
                      message.role === "user"
                        ? "bg-accent-blue text-bg-base"
                        : "border border-stroke bg-bg-base text-text-primary"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div
                    className={`mt-1 text-xs text-text-muted ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-gold text-bg-base">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block rounded-input border border-stroke bg-bg-base p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-accent-gold" />
                      <span className="text-text-muted">
                        Hermes is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stroke p-4">
            <div className="flex space-x-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Hermes about MCP security, vulnerabilities, or best practices..."
                className="flex-1 resize-none rounded-input border border-stroke bg-bg-base px-4 py-3 text-text-primary placeholder-text-muted focus:border-accent-mint focus:outline-none focus:ring-2 focus:ring-accent-mint/20"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-text-muted">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
