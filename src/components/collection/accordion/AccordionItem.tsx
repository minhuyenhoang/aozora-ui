import {
  Disclosure as AriaDisclosure,
  type DisclosureProps as AriaDisclosureProps,
} from "react-aria-components";
import { cx } from "@styles/utils";

export type AccordionItemProps = AriaDisclosureProps;

/** One section of an accordion. Holds an `AccordionControl` and its panel. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AriaDisclosure
      {...props}
      className={(state) =>
        cx(
          // A line between items, but not under the last one.
          "group/accordion-item border-b border-secondary last:border-b-0",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
