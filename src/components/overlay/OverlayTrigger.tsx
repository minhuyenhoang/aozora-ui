import { cx } from "@styles/utils";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { Button as AriaButton } from "react-aria-components";

type OverlayTriggerProps = AriaButtonProps;

export function OverlayTrigger({
  children,
  className,
  ...buttonProps
}: OverlayTriggerProps) {
  return (
    <AriaButton
      {...buttonProps}
      className={(values) =>
        cx(
          "h-max w-max outline-hidden",
          typeof className === "function" ? className(values) : className,
        )
      }
    >
      {children}
    </AriaButton>
  );
}
