import Image from "next/image";
import { cn } from "@/components/ui/utils";
import { HUB_BRAND_ASSETS } from "@/constants/hub-brand";

type HubLogoVariant = "horizontal" | "horizontal-compact" | "stacked" | "icon";

interface BrandLogoProps {
  className?: string;
  /** Altura renderizada em px */
  height?: number;
  /** @deprecated use height */
  iconSize?: number;
}

function resolveHeight(height?: number, iconSize?: number, fallback = 40): number {
  return height ?? iconSize ?? fallback;
}

export function LhHubLogo({
  variant = "horizontal",
  className,
  height,
  iconSize,
}: BrandLogoProps & { variant?: HubLogoVariant }) {
  const h = resolveHeight(height, iconSize, variant === "icon" ? 28 : 40);

  if (variant === "icon") {
    return (
      <Image
        src={HUB_BRAND_ASSETS.hubIcon}
        alt="LH Hub"
        width={120}
        height={80}
        className={cn("w-auto object-contain", className)}
        style={{ height: h }}
      />
    );
  }

  const useCompact = variant === "horizontal-compact";
  const src = useCompact ? HUB_BRAND_ASSETS.hubHorizontalCompact : HUB_BRAND_ASSETS.hubHorizontal;
  const nativeW = useCompact ? 695 : 420;
  const nativeH = useCompact ? 56 : 118;

  return (
    <Image
      src={src}
      alt="LH Hub — Centro operacional"
      width={nativeW}
      height={nativeH}
      className={cn("w-auto object-contain", className)}
      style={{ height: h, width: "auto" }}
      priority
    />
  );
}

export function LhHoldingLogo({ className, height, iconSize }: BrandLogoProps) {
  const h = resolveHeight(height, iconSize, 44);

  return (
    <Image
      src={HUB_BRAND_ASSETS.holding}
      alt="LH Empreendimentos — Holding de negócios"
      width={485}
      height={433}
      className={cn("w-auto object-contain", className)}
      style={{ height: h, width: "auto" }}
      priority
    />
  );
}

export function LhHoldingIcon({ className, height, iconSize }: BrandLogoProps) {
  const h = resolveHeight(height, iconSize, 36);

  return (
    <Image
      src={HUB_BRAND_ASSETS.holdingIcon}
      alt="LH Empreendimentos"
      width={1024}
      height={491}
      className={cn("w-auto object-contain", className)}
      style={{ height: h, width: "auto" }}
      priority
    />
  );
}
