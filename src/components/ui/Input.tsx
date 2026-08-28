import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = ({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) => (
  <label
    className={cn("block text-sm font-medium text-ink mb-1.5", className)}
    {...props}
  >
    {children}
    {required && <span className="text-danger ml-0.5">*</span>}
  </label>
);

export const HelperText = ({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) => (
  <p className={cn("mt-1.5 text-[13px]", error ? "text-danger" : "text-ink-faint")}>
    {children}
  </p>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leadingIcon, trailingIcon, ...props }, ref) => (
    <div className="relative">
      {leadingIcon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-11 rounded-[var(--pb-radius-sm)] border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-faint",
          "border-border-strong transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          leadingIcon && "pl-10",
          trailingIcon && "pr-10",
          className
        )}
        {...props}
      />
      {trailingIcon && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
          {trailingIcon}
        </span>
      )}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-28 rounded-[var(--pb-radius-sm)] border bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint",
        "border-border-strong transition-colors resize-y",
        "focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand",
        error && "border-danger focus:border-danger focus:ring-danger/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full h-11 rounded-[var(--pb-radius-sm)] border bg-surface px-3.5 text-[15px] text-ink appearance-none",
        "border-border-strong transition-colors bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234c5262%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_0.9rem_center] bg-[length:16px]",
        "focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand",
        error && "border-danger",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-4.5 w-4.5 rounded border-border-strong text-brand focus:ring-2 focus:ring-brand/25 accent-[var(--pb-brand)]",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
