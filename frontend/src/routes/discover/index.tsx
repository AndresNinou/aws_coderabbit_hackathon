import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ExternalLink, FileText, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

const searchFormSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export const Route = createFileRoute("/discover/")({
  component: Discover,
});

interface MCPResult {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
}

function Discover() {
  const [searchResults, setSearchResults] = useState<MCPResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
  });

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);

    try {
      // Query Bright Data for MCP implementations
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const results: MCPResult[] = [
        {
          id: "1",
          name: "Acme Crawler MCP",
          url: "mcp.acme.dev",
          description:
            "Advanced web crawling and data extraction with rate limiting and proxy support.",
          tags: ["web-crawling", "data-extraction", "scraping"],
        },
        {
          id: "2",
          name: "Stock News MCP",
          url: "mcp.news.ai",
          description:
            "Real-time financial news aggregation with sentiment analysis and market data integration.",
          tags: ["finance", "news", "sentiment-analysis"],
        },
        {
          id: "3",
          name: "Content Parser MCP",
          url: "mcp.parser.io",
          description:
            "Intelligent content parsing and structured data extraction from various document formats.",
          tags: ["parsing", "documents", "nlp"],
        },
      ];

      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-4 font-heading text-3xl font-bold text-text-primary">
              Find MCPs
            </h1>
            <p className="text-text-muted">
              Discover Model Context Protocol implementations via{" "}
              <span className="font-medium text-accent-blue">Bright Data</span>
            </p>
          </div>

          {/* Search Form */}
          <div className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient">
            <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="web crawling"
                  {...register("topic")}
                  error={errors.topic?.message}
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="flex-shrink-0"
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-bg-base border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search ▸
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-semibold text-text-primary">
                Results
              </h2>

              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-card border border-stroke bg-bg-elev p-6 shadow-ambient transition-colors hover:border-accent-gold/30"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                          {result.name}
                        </h3>
                        <p className="mb-3 font-mono text-sm text-accent-gold">
                          {result.url}
                        </p>
                        <p className="mb-4 leading-relaxed text-text-muted">
                          {result.description}
                        </p>

                        {/* Tags */}
                        <div className="mb-4 flex flex-wrap gap-2">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex rounded-chip bg-accent-blue/20 px-2 py-1 text-xs text-accent-blue"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to="/scan/new"
                        search={{ url: `https://${result.url}` }}
                      >
                        <Button size="sm">
                          <ArrowRight className="mr-1 h-3 w-3" />
                          Analyze
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm">
                        <FileText className="mr-1 h-3 w-3" />
                        View Doc Snippets
                      </Button>
                      <Link to={`https://${result.url}`} target="_blank">
                        <Button variant="secondary" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Visit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchResults.length === 0 && !isSearching && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-text-muted" />
              <h3 className="mb-2 font-heading text-lg font-medium text-text-muted">
                Search for MCPs
              </h3>
              <p className="text-text-muted">
                Enter a topic like "web crawling" or "data analysis" to discover
                relevant MCPs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
