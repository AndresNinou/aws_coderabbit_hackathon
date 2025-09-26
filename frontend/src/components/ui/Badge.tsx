import { forwardRef } from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sealed" | "default";
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full";

    const variantClasses = {
      default: "bg-ink-800 border border-mist-300/12 text-mist-100",
      sealed: "bg-ink-900 border border-seal-mint-500 text-mist-100",
    };

    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      >
        {variant === "sealed" && <Check className="h-3 w-3" />}
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
