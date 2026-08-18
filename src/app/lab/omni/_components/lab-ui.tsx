import Link from "next/link";
import { cn } from "@/lib/utils";
import { OmniRing } from "@/components/hub/lh-monogram";

export function LabBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#7C3CFF]/40 bg-[#7C3CFF]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0CD4FF]",
        className,
      )}
    >
      Lab · teste
    </span>
  );
}

export function OmniWordmark({
  size = 28,
  showTagline = false,
  className,
}: {
  size?: number;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <OmniRing size={size} className="omni-ring-glow" />
      <div>
        <p
          className="font-bold tracking-[0.14em] text-white"
          style={{ fontSize: Math.max(14, size * 0.55) }}
        >
          OMNI
        </p>
        {showTagline && (
          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#A0A0B0]">
            Seu sistema operacional de negócios
          </p>
        )}
      </div>
    </div>
  );
}

export function PaginationDots({
  total,
  active,
  className,
}: {
  total: number;
  active: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active ? "w-5 bg-[#7C3CFF]" : "w-1.5 bg-white/20",
          )}
        />
      ))}
    </div>
  );
}

export function GradientButton({
  children,
  href,
  onClick,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = cn(
    "omni-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(124,60,255,0.4)] transition hover:brightness-110",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const classes = cn(
    "inline-flex w-full items-center justify-center rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-[#0CD4FF] transition hover:border-[#7C3CFF]/40 hover:bg-white/5",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function LabBackBar() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
      <Link href="/lab/omni" className="text-xs font-medium text-[#A0A0B0] hover:text-white">
        ← Hub do lab
      </Link>
      <LabBadge />
      <Link href="/login" className="text-xs font-medium text-[#7C3CFF] hover:text-[#0CD4FF]">
        Produção
      </Link>
    </div>
  );
}
