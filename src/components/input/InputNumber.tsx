import type { ReactNode } from "react";
import {
  type DateFieldProps as AriaDateFieldProps,
  type DateValue,
  NumberField as AriaNumberField,
} from "react-aria-components";
import { DescriptionText } from "../base/DescriptionText";
import {
  InputNumberBase,
  type InputNumberBaseProps,
} from "../base/input/InputNumberBase";
import { Label } from "../base/Label";
import { cx } from "@styles/utils";

export interface InputNumberProps
  extends
    InputNumberBaseProps,
    Pick<AriaDateFieldProps<DateValue>, "granularity"> {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  description?: ReactNode;
  hideRequiredIndicator?: boolean;
}

export function InputNumber({
  size = "md",
  placeholder,
  label,
  description,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  inputClassName,
  wrapperClassName,
  orientation = "vertical",
  ...props
}: InputNumberProps) {
  return (
    <AriaNumberField
      {...props}
      className={(state) =>
        cx(
          "group flex h-max w-full flex-col items-start justify-start gap-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isInvalid, isRequired }) => (
        <>
          {label && (
            <Label
              isRequired={
                hideRequiredIndicator ? !hideRequiredIndicator : isRequired
              }
              isInvalid={isInvalid}
            >
              {label}
            </Label>
          )}

          <InputNumberBase
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              inputClassName,
              wrapperClassName,
              orientation,
              // Tells the input whether to group digits while typing.
              formatOptions: props.formatOptions,
            }}
          />

          {description && (
            <DescriptionText
              isInvalid={isInvalid}
              className={cx(size === "sm" && "text-xs")}
            >
              {description}
            </DescriptionText>
          )}
        </>
      )}
    </AriaNumberField>
  );
}
