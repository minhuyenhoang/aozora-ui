import type { ComponentProps, ReactNode } from "react";
import { cx, sortCx } from "@styles/utils";

interface DialogFooterBaseProps extends ComponentProps<"div"> {
  /** Separates the footer from the content above with a border. */
  divider?: boolean;
}

interface DialogFooterGridProps extends DialogFooterBaseProps {
  /** Two equal-width action buttons. */
  layout?: "grid";
  leading?: never;
}

interface DialogFooterFlexProps extends DialogFooterBaseProps {
  /** Action buttons on the right, with an optional element on the left. */
  layout: "flex";
  /** Element shown on the left, such as a checkbox or tertiary button. */
  leading?: ReactNode;
}

export type DialogFooterProps = DialogFooterGridProps | DialogFooterFlexProps;

const styles = sortCx({
  // Actions stack in reverse on small screens so the primary action is on top.
  base: "relative z-10 flex shrink-0 flex-col-reverse gap-3 p-4 pt-6 sm:px-6 sm:pt-8 sm:pb-6",
  layout: {
    grid: "*:grow sm:grid sm:grid-cols-2",
    flex: "sm:flex-row sm:items-center sm:justify-end",
  },
  divider: "mt-6 border-t border-secondary pt-4 sm:mt-8 sm:pt-6",
});

export function DialogFooter({
  className,
  layout = "grid",
  divider = false,
  leading,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      data-layout={layout}
      className={cx(
        styles.base,
        styles.layout[layout],
        divider && styles.divider,
        className,
      )}
      {...props}
    >
      {layout === "flex" && leading && (
        <div
          data-slot="dialog-footer-leading"
          className="flex items-center max-sm:*:grow sm:mr-auto"
        >
          {leading}
        </div>
      )}
      {children}
    </div>
  );
}
