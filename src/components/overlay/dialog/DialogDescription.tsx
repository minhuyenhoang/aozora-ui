import type { ComponentProps } from "react";
import { cx } from "@styles/utils";

export type DialogDescriptionProps = ComponentProps<"p">;

/** Supporting text shown under the dialog title. */
export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      data-slot="dialog-description"
      className={cx("text-sm text-tertiary", className)}
      {...props}
    />
  );
}
