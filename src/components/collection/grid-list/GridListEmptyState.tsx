import type { ComponentProps, ReactNode } from "react";
import { cx } from "@styles/utils";

export interface GridListEmptyStateProps extends Omit<
  ComponentProps<"div">,
  "title"
> {
  /** Optional icon displayed above the title. */
  icon?: ReactNode;
  /** The primary message. */
  title?: ReactNode;
  /** Optional secondary message displayed below the title. */
  description?: ReactNode;
}

/** The placeholder a grid list displays when it has no items. */
export function GridListEmptyState({
  icon,
  title = "No items",
  description,
  className,
  children,
  ...props
}: GridListEmptyStateProps) {
  return (
    <div
      {...props}
      className={cx(
        "flex w-full flex-col items-center justify-center gap-1 px-4 py-6 text-center",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="mb-1 flex size-6 items-center justify-center text-fg-quaternary [&>svg]:size-full"
        >
          {icon}
        </span>
      )}
      {title && (
        <span className="text-sm font-medium text-secondary">{title}</span>
      )}
      {description && (
        <span className="text-sm text-tertiary">{description}</span>
      )}
      {children}
    </div>
  );
}
