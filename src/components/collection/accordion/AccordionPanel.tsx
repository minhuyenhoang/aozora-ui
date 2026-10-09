import { useContext } from "react";
import {
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { AccordionContext } from "./AccordionContext";

const sizes = {
  sm: "pb-3 text-sm",
  md: "pb-4 text-md",
};

export interface AccordionPanelProps
  extends Omit<AriaDisclosurePanelProps, "className"> {
  /** Class name for the content inside the panel. */
  className?: string;
}

/** The content of an `AccordionItem`, shown while the item is open. */
export function AccordionPanel({
  className,
  children,
  ...props
}: AccordionPanelProps) {
  const { size } = useContext(AccordionContext);

  return (
    <AriaDisclosurePanel
      {...props}
      // React Aria measures the content and sets the height, so opening and
      // closing can slide. The padding is inside, so it is clipped with it.
      className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-200 ease-out motion-reduce:transition-none"
    >
      <div className={cx("text-tertiary", sizes[size], className)}>
        {children}
      </div>
    </AriaDisclosurePanel>
  );
}
