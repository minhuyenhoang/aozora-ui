import {
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
} from "react-aria-components";
import { cx } from "@styles/utils";

export type ToolbarGroupProps = AriaGroupProps;

/** A labelled set of related items inside a toolbar. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <AriaGroup
      {...props}
      className={(state) =>
        cx(
          "flex items-center gap-0.5",
          "group-orientation-vertical/toolbar:flex-col group-orientation-vertical/toolbar:items-stretch",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
