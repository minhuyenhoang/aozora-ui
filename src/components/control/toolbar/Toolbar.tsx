import {
  SeparatorContext as AriaSeparatorContext,
  Toolbar as AriaToolbar,
  type ToolbarProps as AriaToolbarProps,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { ToolbarContext, type ToolbarSize } from "./ToolbarContext";

export interface ToolbarProps extends AriaToolbarProps {
  /** The size of the items in the toolbar. */
  size?: ToolbarSize;
}

/** A row or column of related controls with arrow-key navigation. */
export function Toolbar({
  size = "sm",
  orientation = "horizontal",
  className,
  ...props
}: ToolbarProps) {
  return (
    <ToolbarContext.Provider value={{ size, orientation }}>
      {/* A separator runs across the toolbar's direction. */}
      <AriaSeparatorContext.Provider
        value={
          orientation === "horizontal"
            ? { orientation: "vertical", className: "mx-1" }
            : { orientation: "horizontal", className: "my-1" }
        }
      >
        <AriaToolbar
          {...props}
          orientation={orientation}
          className={(state) =>
            cx(
              "group/toolbar flex w-max max-w-full flex-wrap items-center gap-1",
              state.orientation === "vertical" && "flex-col items-stretch",
              typeof className === "function" ? className(state) : className,
            )
          }
        />
      </AriaSeparatorContext.Provider>
    </ToolbarContext.Provider>
  );
}
