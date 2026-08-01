import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-orange text-brand-on hover:brightness-110 rounded-lg shadow-[0_2px_12px_rgba(255,212,0,0.25)]",
        secondary: "bg-surface-elevated text-text-primary border border-surface-border hover:bg-surface-hover rounded-lg",
        ghost: "text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg",
        destructive: "bg-brand-red/10 text-brand-red hover:bg-brand-red/20 rounded-lg",
        outline: "border border-surface-border bg-transparent text-text-primary hover:bg-surface-hover rounded-lg",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-10 px-5 rounded-lg",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";
