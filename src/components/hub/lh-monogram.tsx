import { cn } from "@/components/ui/utils";

interface OmniRingProps {
  size?: number;
  className?: string;
}

/** Anel OMNI — gradiente roxo → ciano (marca-mãe). */
export function OmniRing({ size = 32, className }: OmniRingProps) {
  const id = `omni-ring-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3CFF" />
          <stop offset="0.5" stopColor="#3882F6" />
          <stop offset="1" stopColor="#0CD4FF" />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** @deprecated use OmniRing — alias para compat. */
export function LhMonogram({ size = 32, className }: OmniRingProps) {
  return <OmniRing size={size} className={className} />;
}

/** Anel outline grande — watermark no fundo do login (sem fill). */
export function LhMonogramOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="omni-outline-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3CFF" />
          <stop offset="0.5" stopColor="#3882F6" />
          <stop offset="1" stopColor="#0CD4FF" />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="url(#omni-outline-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}
