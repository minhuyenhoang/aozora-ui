import type { DropIndicatorProps as AriaDropIndicatorProps } from "react-aria-components";
import { DropIndicator as AriaDropIndicator } from "react-aria-components";
import { cx } from "@styles/utils";

export type TreeDropIndicatorProps = AriaDropIndicatorProps;

export function TreeDropIndicator({
  className,
  ...props
}: TreeDropIndicatorProps) {
  return (
    <AriaDropIndicator
      {...props}
      className={(state) =>
        cx(
          "relative z-20 mx-2 h-0.5 rounded-full bg-brand-solid transition-opacity",
          state.isDropTarget ? "opacity-100" : "opacity-0",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
