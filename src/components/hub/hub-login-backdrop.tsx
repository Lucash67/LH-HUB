"use client";

import { motion } from "framer-motion";
import { LhHoldingIcon } from "@/components/hub/lh-hub-logo";

/** Fundo premium da login — watermark LH + grid + partículas. */
export function HubLoginBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,212,0,0.07),transparent_65%)]" />

      {/* Watermark LH central */}
      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
        animate={{ opacity: [0.035, 0.055, 0.035], scale: [1, 1.02, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <LhHoldingIcon height={420} className="w-auto max-w-none sm:h-[480px] lg:h-[560px]" />
      </motion.div>

      {/* Grid no chão */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] opacity-[0.07]">
        <motion.div
          animate={{ y: [0, 40] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="h-[calc(100%+40px)] w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,212,0,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,0,0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            transform: "perspective(500px) rotateX(62deg)",
            transformOrigin: "center bottom",
          }}
        />
      </div>

      {/* Partículas */}
      {[
        { left: "18%", top: "22%", delay: 0 },
        { left: "72%", top: "18%", delay: 1.2 },
        { left: "85%", top: "55%", delay: 2.4 },
        { left: "12%", top: "62%", delay: 0.8 },
      ].map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[#FFD400]/60 shadow-[0_0_8px_rgba(255,212,0,0.8)]"
          style={{ left: p.left, top: p.top }}
          animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -12, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
    </div>
  );
}
