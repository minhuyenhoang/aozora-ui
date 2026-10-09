import { type RefAttributes, createContext } from "react";
import {
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps,
} from "react-aria-components";
import { cx, sortCx } from "@styles/utils";

export const buttonGroupStyles = sortCx({
  common: {
    root: [
      "group/button-group inline-flex h-max cursor-pointer items-center bg-primary font-semibold whitespace-nowrap text-secondary shadow-skeuomorphic ring-1 ring-primary outline-brand transition duration-100 ease-linear ring-inset",
      // Hover and focus styles
      "hover:bg-primary_hover hover:text-secondary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
      // Disabled styles
      "disabled:cursor-not-allowed disabled:text-secondary/50 disabled:*:opacity-50",
      // Selected styles
      "selected:bg-primary_hover selected:text-secondary_hover",
    ].join(" "),
    icon: "pointer-events-none text-fg-quaternary transition-[inherit] group-hover/button-group:text-fg-quaternary_hover group-selected/button-group:text-fg-quaternary_hover",
  },

  sizes: {
    sm: {
      root: "gap-1.5 px-3.5 py-2 text-sm not-last:pr-[calc(calc(var(--spacing)*3.5)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-3 data-icon-only:px-2.5",
      icon: "size-5",
    },
    md: {
      root: "gap-1.5 px-4 py-2.5 text-sm not-last:pr-[calc(calc(var(--spacing)*4)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-3.5 data-icon-only:px-3",
      icon: "size-5",
    },
    lg: {
      root: "gap-2 px-4.5 py-2.5 text-md not-last:pr-[calc(calc(var(--spacing)*4.5)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-4 data-icon-only:px-3.5",
      icon: "size-5",
    },
  },
});

export type ButtonSize = keyof typeof buttonGroupStyles.sizes;

export const ButtonGroupContext = createContext<{ size: ButtonSize }>({
  size: "md",
});

interface ButtonGroupProps
  extends
    Omit<ToggleButtonGroupProps, "orientation">,
    RefAttributes<HTMLDivElement> {
  size?: ButtonSize;
  className?: string;
}

export function ButtonGroup({
  children,
  size = "md",
  className,
  ...otherProps
}: ButtonGroupProps) {
  return (
    <ButtonGroupContext.Provider value={{ size }}>
      <AriaToggleButtonGroup
        selectionMode="single"
        className={cx(
          "relative z-0 inline-flex w-max -space-x-px rounded-lg shadow-xs",
          className,
        )}
        {...otherProps}
      >
        {children}
      </AriaToggleButtonGroup>
    </ButtonGroupContext.Provider>
  );
}
