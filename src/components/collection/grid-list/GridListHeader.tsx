import type { GridListHeaderProps as AriaGridListHeaderProps } from "react-aria-components";
import { GridListHeader as AriaGridListHeader } from "react-aria-components";
import { cx } from "@styles/utils";
import { useGridListContext } from "./GridListContext";

export type GridListHeaderProps = AriaGridListHeaderProps;

const sizes = {
  sm: "px-2 pt-2 pb-1 text-xs",
  md: "px-2.5 pt-2.5 pb-1.5 text-sm",
};

/** The heading of a grid list section. */
export function GridListHeader({ className, ...props }: GridListHeaderProps) {
  const { size } = useGridListContext();

  return (
    <AriaGridListHeader
      {...props}
      className={cx(
        "font-semibold text-tertiary select-none",
        sizes[size],
        className,
      )}
    />
  );
}
