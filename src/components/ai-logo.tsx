import Image from "next/image";

interface AiLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

/** Shared Sanket AI mark for recommendations and AI-assisted actions. */
export function AiLogo({ size = 20, className, alt = "Sanket AI" }: AiLogoProps) {
  return (
    <Image
      src="/ai.svg"
      alt={alt}
      width={size}
      height={size}
      className={className}
    />
  );
}
