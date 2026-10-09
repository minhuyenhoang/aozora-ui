import type { ComponentProps } from "react";
import { cx } from "@styles/utils";

export type DialogBodyProps = ComponentProps<"div">;

/**
 * The main content of the dialog, placed between the header and footer.
 * It scrolls when the content is taller than the space available.
 */
export function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      data-slot="dialog-body"
      className={cx(
        // The only part of the dialog that scrolls.
        // The top gap is a margin, so scrolled content stays clear of the header.
        "relative mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}
