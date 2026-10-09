import type { ReactNode } from "react";
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { DescriptionText } from "../base/DescriptionText";
import { Label } from "../base/Label";
import { InputBase, type InputBaseProps } from "../base/input/InputBase";
import { TextField } from "../base/input/TextField";

export interface InputTextProps
  extends
    AriaTextFieldProps,
    Pick<
      InputBaseProps,
      | "ref"
      | "placeholder"
      | "icon"
      | "shortcut"
      | "tooltip"
      | "groupRef"
      | "size"
      | "wrapperClassName"
      | "inputClassName"
      | "iconClassName"
      | "tooltipClassName"
    > {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  description?: ReactNode;
  /** Whether to hide required indicator from label */
  hideRequiredIndicator?: boolean;
}

export function InputText({
  size = "md",
  placeholder,
  icon: Icon,
  label,
  description,
  shortcut,
  hideRequiredIndicator,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  type = "text",
  ...props
}: InputTextProps) {
  return (
    <TextField
      aria-label={!label ? placeholder : undefined}
      {...props}
      size={size}
      className={className}
    >
      {({ isRequired, isInvalid }) => (
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

          <InputBase
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              icon: Icon,
              shortcut,
              iconClassName,
              inputClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
              type,
            }}
          />

          {description && (
            <DescriptionText isInvalid={isInvalid}>
              {description}
            </DescriptionText>
          )}
        </>
      )}
    </TextField>
  );
}
