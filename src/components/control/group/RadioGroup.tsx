import type { ReactNode } from "react";
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
import {
  RadioGroupContext,
  type RadioGroupContextType,
} from "./RadioGroupContext";
import { cx } from "@styles/utils";

export interface RadioGroupProps
  extends RadioGroupContextType, AriaRadioGroupProps {
  children: ReactNode;
  className?: string;
}

export function RadioGroup({
  children,
  className,
  size = "sm",
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ size }}>
      <AriaRadioGroup
        {...props}
        className={cx("flex flex-col gap-4", className)}
      >
        {children}
      </AriaRadioGroup>
    </RadioGroupContext.Provider>
  );
}
