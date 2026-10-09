import type { HTMLAttributes } from "react";
import { cx } from "@styles/utils";

interface InputPrefixProps extends HTMLAttributes<HTMLDivElement> {
  /** The position of the prefix. */
  position?: "leading" | "trailing";
  /** Indicates that the prefix is disabled. */
  isDisabled?: boolean;
}

export function InputPrefix({ children, ...props }: InputPrefixProps) {
  return (
    <span
      {...props}
      className={cx(
        "flex text-tertiary shadow-xs ring-1 ring-border-primary ring-inset",
        // Styles when the prefix is within an `InputGroup`
        "in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-l-lg",
        "in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-r-lg",
        // Default size styles
        "px-3 py-2 text-md",
        // Small size styles
        "in-data-input-wrapper:in-data-[input-size=sm]:px-3 in-data-input-wrapper:in-data-[input-size=sm]:py-2 in-data-input-wrapper:in-data-[input-size=sm]:text-sm",
        // Large size styles
        "in-data-input-wrapper:in-data-[input-size=lg]:py-2.5 in-data-input-wrapper:in-data-[input-size=lg]:pr-3 in-data-input-wrapper:in-data-[input-size=lg]:pl-3.5",

        props.className,
      )}
    >
      {children}
    </span>
  );
}
