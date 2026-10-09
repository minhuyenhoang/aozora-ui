import {
  DisclosureGroup as AriaDisclosureGroup,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { AccordionContext, type AccordionSize } from "./AccordionContext";

export interface AccordionProps extends AriaDisclosureGroupProps {
  /**
   * The size of the items.
   * @default "md"
   */
  size?: AccordionSize;
}

/**
 * A stack of items that each show or hide a panel of content.
 * One item is open at a time, unless `allowsMultipleExpanded` is set.
 */
export function Accordion({ size = "md", className, ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ size }}>
      <AriaDisclosureGroup
        {...props}
        className={(state) =>
          cx(
            "flex w-full flex-col",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    </AccordionContext.Provider>
  );
}
