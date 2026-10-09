import {
  Separator as AriaSeparator,
  SeparatorContext as AriaSeparatorContext,
  type SeparatorProps as AriaSeparatorProps,
  useSlottedContext,
} from "react-aria-components";
import { cx } from "@styles/utils";

export type SeparatorProps = AriaSeparatorProps;

/**
 * A thin line that divides content. It is horizontal unless `orientation` is
 * set, or a parent such as `Toolbar` sets the orientation for it.
 */
export function Separator({ className, ...props }: SeparatorProps) {
  // A parent can set the orientation through context. It is read here too,
  // because the line's shape depends on it.
  const context = useSlottedContext(AriaSeparatorContext, props.slot);
  const orientation =
    props.orientation ?? context?.orientation ?? "horizontal";

  return (
    <AriaSeparator
      {...props}
      orientation={orientation}
      className={cx(
        "shrink-0 border-none bg-border-secondary",
        orientation === "vertical" ? "w-px self-stretch" : "h-px w-full",
        className,
      )}
    />
  );
}
