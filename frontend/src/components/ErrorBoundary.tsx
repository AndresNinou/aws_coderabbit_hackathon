import React, { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
          <div className="w-full max-w-lg">
            <div className="rounded-card border border-stroke bg-bg-elev p-8 text-center shadow-ambient">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-red/20">
                  <svg
                    className="h-8 w-8 text-accent-red"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h2 className="mb-2 font-heading text-xl font-semibold text-text-primary">
                  Something went wrong
                </h2>
                <p className="text-text-muted">
                  We encountered an unexpected error. This has been logged and
                  we'll work to fix it.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-center gap-3">
                  <Button onClick={this.handleRetry} variant="secondary">
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload}>Reload Page</Button>
                </div>

                {this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-text-muted hover:text-text-primary">
                      Technical Details
                    </summary>
                    <div className="mt-3 rounded-input border border-stroke bg-bg-base p-3">
                      <pre className="overflow-auto whitespace-pre-wrap text-xs text-text-muted">
                        {this.state.error.message}
                        {this.state.error.stack && (
                          <>
                            {"\n\nStack trace:\n"}
                            {this.state.error.stack}
                          </>
                        )}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
