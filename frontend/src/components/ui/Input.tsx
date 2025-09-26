import { forwardRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "~/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  copyable?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, warning, copyable, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (props.value) {
        await navigator.clipboard.writeText(String(props.value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const inputClasses = cn(
      "w-full bg-ink-900 border rounded-input px-4 py-2 text-mist-100 placeholder-mist-300",
      "focus:ring-2 focus:ring-seal-glow focus:border-seal-mint-600",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      error && "border-danger focus:ring-danger",
      warning && "border-warn focus:ring-warn",
      !error && !warning && "border-mist-300/12",
      className,
    );

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-mist-100"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input className={inputClasses} ref={ref} {...props} />
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted transition-colors hover:text-text-primary"
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent-mint" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {warning && !error && <p className="text-sm text-warn">{warning}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
