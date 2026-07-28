import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-brand-red focus:border-brand-red focus:ring-brand-red/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  InputHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ className, label, error, id, children, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
    )}
    <select
      id={id}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-2 text-sm text-text-primary transition-colors focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-brand-red">{error}</p>}
  </div>
));
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  InputHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
    )}
    <textarea
      id={id}
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-brand-red">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
