import type { FC, ReactNode } from "react";
import { isValidElement, useContext } from "react";
import type {
  TabProps as AriaTabProps,
  TabRenderProps as AriaTabRenderProps,
} from "react-aria-components";
import { Tab as AriaTab } from "react-aria-components";
import { Badge } from "../../status/badge/Badge";
import { cx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { TabListContext } from "./TabListContext";

// Styles for different types of tab
const getTabStyles = ({
  isFocusVisible,
  isSelected,
  isHovered,
}: AriaTabRenderProps) => ({
  "button-brand": cx(
    "outline-focus-ring *:data-icon:text-fg-quaternary",
    isFocusVisible && "outline-2 -outline-offset-2",
    (isSelected || isHovered) &&
      "bg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover",
  ),
  "button-gray": cx(
    "outline-focus-ring *:data-icon:text-fg-quaternary",
    isHovered &&
      "bg-primary_hover text-secondary *:data-icon:text-fg-secondary_hover",
    isFocusVisible && "outline-2 -outline-offset-2",
    isSelected &&
      "bg-primary_hover text-secondary *:data-icon:text-fg-secondary_hover",
  ),
  "button-border": cx(
    "outline-focus-ring *:data-icon:text-fg-quaternary",
    isFocusVisible && "outline-2 -outline-offset-2",
    (isSelected || isHovered) &&
      "bg-primary_alt text-secondary shadow-sm *:data-icon:text-fg-secondary_hover",
  ),
  "button-minimal": cx(
    "rounded-lg outline-focus-ring *:data-icon:text-fg-quaternary",
    isFocusVisible && "outline-2 -outline-offset-2",
    (isSelected || isHovered) &&
      "bg-primary_alt text-secondary shadow-xs ring-1 ring-primary ring-inset *:data-icon:text-fg-secondary_hover",
  ),
  underline: cx(
    "rounded-none border-b-2 border-transparent outline-focus-ring *:data-icon:text-fg-quaternary",
    isFocusVisible && "outline-2 -outline-offset-2",
    (isSelected || isHovered) &&
      "border-fg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover",
  ),
  line: cx(
    "rounded-none border-l-2 border-transparent outline-focus-ring *:data-icon:text-fg-quaternary",
    isFocusVisible && "outline-2 -outline-offset-2",
    (isSelected || isHovered) &&
      "border-fg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover",
  ),
});

const sizes = {
  sm: {
    base: "text-sm font-semibold gap-1 *:data-icon:size-4",
    "button-brand": "py-2 px-2.5",
    "button-gray": "py-2 px-2.5",
    "button-border": "py-2 px-2.5",
    "button-minimal": "py-2 px-2.5",
    underline: "px-0.5 pb-2.5 pt-0",
    line: "pl-2.5 pr-3 py-0.5",
  },
  md: {
    base: "text-md font-semibold gap-1.5 *:data-icon:size-5",
    "button-brand": "py-2.5 px-2.5",
    "button-gray": "py-2.5 px-2.5",
    "button-border": "py-2.5 px-2.5",
    "button-minimal": "py-2.5 px-2.5",
    underline: "px-0.5 pb-2.5 pt-0",
    line: "pr-3.5 pl-3 py-1",
  },
};
export interface TabComponentProps extends AriaTabProps {
  /** The label of the tab. */
  label?: ReactNode;
  /** The children of the tab. */
  children?: ReactNode | ((props: AriaTabRenderProps) => ReactNode);
  /** Icon component or element to show before the text */
  icon?: FC<{ className?: string }> | ReactNode;
  /** The badge displayed next to the label. */
  badge?: number | string;
}

export const Tab = ({
  label,
  children,
  badge,
  icon: Icon,
  className,
  ...otherProps
}: TabComponentProps) => {
  const {
    size = "sm",
    type = "button-brand",
    fullWidth,
  } = useContext(TabListContext);

  const showPillColorBadge =
    type === "underline" || type === "line" || type === "button-brand";

  return (
    <AriaTab
      {...otherProps}
      className={(prop) =>
        cx(
          "z-10 flex h-max cursor-pointer items-center justify-center gap-2 rounded-md whitespace-nowrap text-quaternary transition duration-100 ease-linear",
          "group-orientation-vertical:justify-start",
          fullWidth && "w-full flex-1",
          sizes[size].base,
          sizes[size][type],
          getTabStyles(prop)[type],
          typeof className === "function" ? className(prop) : className,
        )
      }
    >
      {(state) => (
        <>
          {/* Icon */}
          {isValidElement(Icon) && Icon}
          {isReactComponent(Icon) && (
            <Icon data-icon className="transition-inherit-all" />
          )}

          <span
            className={cx(
              "flex items-center gap-1.5",
              type !== "line" && "px-0.5",
            )}
          >
            {typeof children === "function"
              ? children(state)
              : children || label}

            {/* Badge */}
            {badge && (
              <Badge
                size="sm"
                type={showPillColorBadge ? "pill-color" : "modern"}
                color={
                  showPillColorBadge && (state.isHovered || state.isSelected)
                    ? "brand"
                    : "gray"
                }
                className={cx(
                  "hidden transition-inherit-all md:flex",
                  size === "sm" && "-my-px",
                )}
              >
                {badge}
              </Badge>
            )}
          </span>
        </>
      )}
    </AriaTab>
  );
};
