import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { TextField as AriaTextField } from "react-aria-components";
import {
  TextFieldContext,
  type TextFieldContextProps,
} from "./TextFieldContext";
import { cx } from "@styles/utils";

export interface TextFieldProps
  extends AriaTextFieldProps, TextFieldContextProps {}

export function TextField({
  className,
  size = "md",
  inputClassName,
  wrapperClassName,
  iconClassName,
  tooltipClassName,
  ...props
}: TextFieldProps) {
  return (
    <TextFieldContext.Provider
      value={{
        inputClassName,
        wrapperClassName,
        iconClassName,
        tooltipClassName,
        size,
      }}
    >
      <AriaTextField
        {...props}
        data-input-wrapper
        data-input-size={size}
        className={(state) =>
          cx(
            "group flex h-max w-full flex-col items-start justify-start gap-1.5",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
    </TextFieldContext.Provider>
  );
}
