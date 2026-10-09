import type { ReactNode, Ref } from "react";
import type { TextProps as AriaTextProps } from "react-aria-components";
import { Text as AriaText } from "react-aria-components";
import { cx } from "@styles/utils";

interface DescriptionTextProps extends AriaTextProps {
  /** Indicates that the Description text is an error message. */
  isInvalid?: boolean;
  ref?: Ref<HTMLElement>;
  size?: "sm" | "md";
  children: ReactNode;
}

export function DescriptionText({
  isInvalid,
  className,
  size = "md",
  ...props
}: DescriptionTextProps) {
  return (
    <AriaText
      {...props}
      slot={isInvalid ? "errorMessage" : "description"}
      className={cx(
        "text-sm text-tertiary",

        // Size
        size === "sm" && "text-xs",
        "in-data-[input-size=sm]:text-xs",

        // Invalid state
        isInvalid && "text-destructive-primary",
        "group-invalid:text-destructive-primary",

        className,
      )}
    />
  );
}
