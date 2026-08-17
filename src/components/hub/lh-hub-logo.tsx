import { cn } from "@/components/ui/utils";
import { OmniRing } from "@/components/hub/lh-monogram";
import { HUB_COPY } from "@/constants/hub-brand";

type HubLogoVariant = "horizontal" | "horizontal-compact" | "stacked" | "icon";

interface BrandLogoProps {
  className?: string;
  height?: number;
  iconSize?: number;
}

function resolveHeight(height?: number, iconSize?: number, fallback = 40): number {
  return height ?? iconSize ?? fallback;
}

/** Logo do produto OMNI Business. */
export function LhHubLogo({
  variant = "horizontal",
  className,
  height,
  iconSize,
}: BrandLogoProps & { variant?: HubLogoVariant }) {
  const h = resolveHeight(height, iconSize, variant === "icon" ? 28 : 40);

  if (variant === "icon") {
    return <OmniRing size={h} className={className} />;
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} style={{ height: h }}>
      <OmniRing size={Math.round(h * 0.85)} />
      <span
        className="font-bold tracking-[0.08em] text-white"
        style={{ fontSize: h * 0.38 }}
      >
        OMNI{" "}
        <span className="font-semibold tracking-normal text-text-muted">Business</span>
      </span>
    </div>
  );
}

/** Logo da marca-mãe OMNI. */
export function LhHoldingLogo({ className, height, iconSize }: BrandLogoProps) {
  const h = resolveHeight(height, iconSize, 44);

  return (
    <div
      className={cn("inline-flex flex-col items-start justify-center gap-1", className)}
      style={{ minHeight: h }}
    >
      <div className="inline-flex items-center gap-3">
        <OmniRing size={Math.min(56, Math.round(h * 0.55))} />
        <div className="leading-tight">
          <p className="text-lg font-bold tracking-[0.12em] text-white sm:text-xl">OMNI</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
            {HUB_COPY.holdingTagline}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LhHoldingIcon({ className, height, iconSize }: BrandLogoProps) {
  const h = resolveHeight(height, iconSize, 36);
  return <OmniRing size={h} className={className} />;
}
