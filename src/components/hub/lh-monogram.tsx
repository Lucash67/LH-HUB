import { cn } from "@/components/ui/utils";

interface LhMonogramProps {
  className?: string;
  size?: number;
}

/** Monograma LH — barras arquitetônicas da identidade LH Empreendimentos. */
export function LhMonogram({ className, size = 48 }: LhMonogramProps) {
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
        <linearGradient id="lh-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FFD400" />
        </linearGradient>
      </defs>
      {/* L — barra esquerda + base */}
      <rect x="4" y="8" width="10" height="32" rx="1" fill="url(#lh-gold)" />
      <rect x="4" y="34" width="22" height="6" rx="1" fill="url(#lh-gold)" />
      {/* H — duas colunas + travessa */}
      <rect x="22" y="8" width="8" height="32" rx="1" fill="url(#lh-gold)" />
      <rect x="36" y="8" width="8" height="32" rx="1" fill="url(#lh-gold)" />
      <rect x="22" y="20" width="22" height="6" rx="1" fill="url(#lh-gold)" />
    </svg>
  );
}
