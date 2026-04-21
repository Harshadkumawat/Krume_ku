import React, { memo } from "react";
import { Loader2 } from "lucide-react";

const baseStyles =
  "inline-flex items-center justify-center font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed italic rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

const variantsStyles = {
  primary: "bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10",
  outline:
    "bg-white border-2 border-black text-black hover:bg-black hover:text-white",
  danger:
    "bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white",
  ghost: "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black",
  dark_outline:
    "bg-zinc-900 border border-white/10 text-white hover:bg-white hover:text-black",
};

const sizesStyles = {
  sm: "px-4 py-2 text-[8px]",
  md: "px-6 py-3.5 text-[10px]",
  lg: "px-8 py-4 text-[11px]",
  xl: "px-10 py-5 text-xs",
};

const Button = memo(
  ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className = "",
    disabled = false,
    icon: Icon,
    type = "button",
    ...props
  }) => {
    if (
      process.env.NODE_ENV === "development" &&
      !children &&
      !props["aria-label"]
    ) {
      console.warn(
        "[Button]: Icon-only button detected with no aria-label. Add aria-label for accessibility.",
      );
    }

    const isDisabled = isLoading || disabled;

    const variantClass = variantsStyles[variant] ?? variantsStyles.primary;
    const sizeClass = sizesStyles[size] ?? sizesStyles.md;

    return (
      <button
        type={type}
        className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin mr-2" size={16} aria-hidden="true" />
        ) : Icon ? (
          <Icon
            className={children ? "mr-2" : ""}
            size={16}
            aria-hidden="true"
          />
        ) : null}

        <span
          aria-live={isLoading ? "polite" : undefined}
          className="flex items-center"
        >
          {isLoading ? "Wait..." : children}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
