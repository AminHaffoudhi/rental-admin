import { Link } from "react-router-dom";
import logoSrc from "@/assets/logo.png";
import { PLATFORM_NAME } from "@/config/brand";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-6",
  sm: "h-8",
  md: "h-9",
  lg: "h-11",
  xl: "h-14",
  "2xl": "h-16",
} as const;

export type PlatformLogoSize = keyof typeof sizeClasses;

type PlatformLogoProps = {
  size?: PlatformLogoSize;
  showWordmark?: boolean;
  inverseWordmark?: boolean;
  linkTo?: string | false;
  className?: string;
  imgClassName?: string;
  wordmarkClassName?: string;
};

export function PlatformLogo({
  size = "md",
  showWordmark = false,
  inverseWordmark = false,
  linkTo = "/",
  className,
  imgClassName,
  wordmarkClassName,
}: PlatformLogoProps) {
  const image = (
    <img
      src={logoSrc}
      alt={PLATFORM_NAME}
      className={cn("w-auto shrink-0 object-contain", sizeClasses[size], imgClassName)}
    />
  );

  const wordmark = showWordmark ? (
    <span
      className={cn(
        "font-display font-semibold tracking-tight",
        size === "2xl" || size === "xl" ? "text-2xl" : size === "lg" ? "text-lg" : "text-sm",
        inverseWordmark ? "text-white" : "text-stone-900",
        wordmarkClassName
      )}
    >
      {PLATFORM_NAME}
    </span>
  ) : null;

  const content = (
    <>
      {image}
      {wordmark}
    </>
  );

  const wrapperClass = cn("inline-flex items-center gap-2.5", className);

  if (linkTo === false) {
    return <span className={wrapperClass}>{content}</span>;
  }

  return (
    <Link to={linkTo} className={wrapperClass}>
      {content}
    </Link>
  );
}
