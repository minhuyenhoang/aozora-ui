import { Toaster as ToasterPrimitive, type ToasterProps } from "sonner";
import { cx } from "@styles/utils";

export function Toast(props: ToasterProps) {
  return (
    <ToasterPrimitive
      className="toaster group"
      richColors
      toastOptions={{
        className: cx(
          "not-has-data-[slot=note]:backdrop-blur-3xl will-change-transform *:data-[slot=note]:relative *:data-[slot=note]:z-50 *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1",
          "**:data-action:[--normal-bg:var(--color-primary-fg)] **:data-action:[--normal-text:var(--color-primary)]",
        ),
      }}
      {...props}
    />
  );
}
