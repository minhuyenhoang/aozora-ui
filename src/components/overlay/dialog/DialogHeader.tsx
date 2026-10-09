import type { ComponentProps, ReactNode } from "react";
import { cx, sortCx } from "@styles/utils";
import { DialogDescription } from "./DialogDescription";
import { DialogTitle } from "./DialogTitle";

export type DialogHeaderAlignment = "left" | "center";

interface DialogHeaderBaseProps extends Omit<ComponentProps<"div">, "title"> {
  /** Shorthand for rendering a `DialogTitle`. */
  title?: ReactNode;
  /** Shorthand for rendering a `DialogDescription`. */
  description?: ReactNode;
  /** Leading visual, such as a featured icon, avatar or image. */
  media?: ReactNode;
  /** Separates the header from the content below with a border. */
  divider?: boolean;
}

interface DialogHeaderStackedProps extends DialogHeaderBaseProps {
  /** Places the media above the title and description. */
  layout?: "stacked";
  /** Horizontal alignment of the stacked content. */
  alignment?: DialogHeaderAlignment;
}

interface DialogHeaderHorizontalProps extends DialogHeaderBaseProps {
  /** Places the media beside the title and description. Always left-aligned. */
  layout: "horizontal";
  alignment?: never;
}

export type DialogHeaderProps =
  DialogHeaderStackedProps | DialogHeaderHorizontalProps;

const styles = sortCx({
  root: {
    base: "flex shrink-0 flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6",
    // Stacks on small screens, like the stacked layout.
    horizontal: "sm:flex-row",
    divider: "border-b border-secondary pb-5",
  },
  text: "relative z-10 flex min-w-0 flex-col gap-0.5",
  alignment: {
    left: { root: "items-start text-left", text: "items-start" },
    center: { root: "items-center text-center", text: "items-center" },
  },
});

export function DialogHeader({
  className,
  title,
  description,
  media,
  divider = false,
  layout = "stacked",
  alignment = "left",
  children,
  ...props
}: DialogHeaderProps) {
  const isHorizontal = layout === "horizontal";
  const resolvedAlignment = isHorizontal ? "left" : alignment;

  return (
    <div
      data-slot="dialog-header"
      data-layout={layout}
      data-alignment={resolvedAlignment}
      className={cx(
        styles.root.base,
        styles.alignment[resolvedAlignment].root,
        isHorizontal && styles.root.horizontal,
        divider && styles.root.divider,
        className,
      )}
      {...props}
    >
      {media && (
        <div data-slot="dialog-media" className="relative size-max shrink-0">
          {media}
        </div>
      )}

      <div
        className={cx(styles.text, styles.alignment[resolvedAlignment].text)}
      >
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
      </div>
    </div>
  );
}
