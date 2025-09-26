import { forwardRef } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "destructive"
    | "destructive-outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-seal-mint-600 border border-seal-mint-600 text-ink-950 hover:bg-seal-mint-700 hover:border-seal-mint-700 focus:ring-2 focus:ring-seal-glow",
      secondary:
        "border border-seal-mint-500 text-mist-100 bg-ink-900 hover:bg-seal-mint-500/10 hover:border-seal-mint-600 focus:ring-2 focus:ring-seal-glow",
      ghost:
        "text-mist-100 hover:text-seal-mint-500 hover:underline hover:underline-seal-mint-500 focus:ring-2 focus:ring-seal-glow",
      destructive:
        "bg-danger border border-danger text-white hover:bg-danger/90",
      "destructive-outline":
        "border border-danger text-danger hover:bg-danger hover:text-white",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm rounded-input",
      md: "px-4 py-2 text-base rounded-input",
      lg: "px-6 py-3 text-lg rounded-card",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
