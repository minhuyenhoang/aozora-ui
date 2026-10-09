import { type FC, type ReactNode, isValidElement, useContext } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from "react-aria-components";
import { cx, sortCx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { ToolbarContext } from "./ToolbarContext";

const styles = sortCx({
  common: {
    root: [
      "group/toolbar-item inline-flex cursor-pointer items-center justify-center rounded-md font-semibold whitespace-nowrap text-tertiary outline-focus-ring transition duration-100 ease-linear",
      // Vertical toolbars
      "group-orientation-vertical/toolbar:justify-start",
      // Hover and focus styles
      "hover:bg-primary_hover hover:text-tertiary_hover focus-visible:outline-2 focus-visible:outline-offset-2",
      // Disabled styles
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Selected styles
      "selected:bg-primary_hover selected:text-secondary_hover",
    ].join(" "),
    icon: "pointer-events-none shrink-0 text-fg-quaternary transition-[inherit] group-hover/toolbar-item:text-fg-quaternary_hover group-selected/toolbar-item:text-fg-secondary",
  },
  sizes: {
    sm: {
      root: "gap-1 px-2 py-1.5 text-sm data-icon-only:p-1.5",
      icon: "size-4 stroke-[2.25px]",
    },
    md: {
      root: "gap-1.5 px-2.5 py-2 text-sm data-icon-only:p-2",
      icon: "size-5",
    },
  },
});

interface ToolbarItemCommonProps {
  /** Icon component or element shown before the text. */
  icon?: FC<{ className?: string }> | ReactNode;
  children?: ReactNode;
  className?: string;
}

interface ToolbarButtonItemProps
  extends
    ToolbarItemCommonProps,
    Omit<AriaButtonProps, "children" | "className"> {
  /** Renders a toggle that can be pressed on and off. */
  isToggle?: false;
}

interface ToolbarToggleItemProps
  extends
    ToolbarItemCommonProps,
    Omit<AriaToggleButtonProps, "children" | "className"> {
  /** Renders a toggle that can be pressed on and off. */
  isToggle: true;
}

export type ToolbarItemProps = ToolbarButtonItemProps | ToolbarToggleItemProps;

/** A button in a toolbar. Set `isToggle` for an on and off control. */
export function ToolbarItem({
  icon: Icon,
  children,
  className,
  ...props
}: ToolbarItemProps) {
  const { size } = useContext(ToolbarContext);

  const sharedProps = {
    "data-icon-only": Icon && !children ? true : undefined,
    className: cx(styles.common.root, styles.sizes[size].root, className),
    children: (
      <>
        {isReactComponent(Icon) && (
          <Icon
            aria-hidden="true"
            className={cx(styles.common.icon, styles.sizes[size].icon)}
          />
        )}
        {isValidElement(Icon) && Icon}
        {children}
      </>
    ),
  };

  if (props.isToggle) {
    const { isToggle: _isToggle, ...toggleProps } = props;

    return <AriaToggleButton {...toggleProps} {...sharedProps} />;
  }

  const { isToggle: _isToggle, ...buttonProps } = props;

  return <AriaButton {...buttonProps} {...sharedProps} />;
}
