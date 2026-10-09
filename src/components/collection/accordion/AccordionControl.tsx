import { type FC, type ReactNode, isValidElement, useContext } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Heading as AriaHeading,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { AccordionContext } from "./AccordionContext";

const sizes = {
  sm: { root: "gap-2 py-3 text-sm", icon: "size-4", chevron: "size-4" },
  md: { root: "gap-3 py-4 text-md", icon: "size-5", chevron: "size-5" },
};

export interface AccordionControlProps
  extends Omit<AriaButtonProps, "children" | "className" | "slot"> {
  /** The title of the item. */
  children: ReactNode;
  /** Icon component or element to show before the title. */
  icon?: FC<{ className?: string }> | ReactNode;
  /**
   * The level of the heading that wraps the button. Choose it to fit the
   * headings around the accordion.
   * @default 3
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/** The button that shows or hides the panel of its `AccordionItem`. */
export function AccordionControl({
  children,
  icon: Icon,
  headingLevel = 3,
  className,
  ...props
}: AccordionControlProps) {
  const { size } = useContext(AccordionContext);

  return (
    <AriaHeading level={headingLevel} className="m-0">
      <AriaButton
        {...props}
        slot="trigger"
        className={(state) =>
          cx(
            "group flex w-full cursor-pointer items-center rounded-md text-left font-semibold text-secondary outline-focus-ring transition duration-100 ease-linear",
            sizes[size].root,
            state.isHovered && "text-secondary_hover",
            state.isFocusVisible && "outline-2 outline-offset-2",
            state.isDisabled && "cursor-not-allowed",
            className,
          )
        }
      >
        {isValidElement(Icon) && Icon}
        {isReactComponent(Icon) && (
          <Icon
            aria-hidden="true"
            className={cx(
              "shrink-0 text-fg-quaternary transition-inherit-all group-hover:text-fg-quaternary_hover",
              sizes[size].icon,
            )}
          />
        )}

        <span className="min-w-0 flex-1">{children}</span>

        {/* Points down while closed, and up while the panel is open. */}
        <IconChevronDown
          aria-hidden="true"
          className={cx(
            "shrink-0 text-fg-quaternary transition duration-200 ease-out group-hover:text-fg-quaternary_hover group-data-expanded/accordion-item:rotate-180 motion-reduce:transition-none",
            sizes[size].chevron,
          )}
        />
      </AriaButton>
    </AriaHeading>
  );
}
