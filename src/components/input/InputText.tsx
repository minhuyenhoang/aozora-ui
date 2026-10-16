import type { ReactNode } from "react";
import { useControlledState } from "react-stately/useControlledState";
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
  /** Shows a button at the end of the input that clears its value */
  isClearable?: boolean;
  /** Called after the clear button clears the value */
  onClear?: () => void;
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
  isClearable,
  onClear,
  value: valueProp,
  defaultValue,
  onChange,
  ...props
}: InputTextProps) {
  const [value, setValue] = useControlledState(
    valueProp,
    defaultValue ?? "",
    onChange,
  );

  const isClearVisible =
    isClearable && value !== "" && !props.isDisabled && !props.isReadOnly;

  return (
    <TextField
      aria-label={!label ? placeholder : undefined}
      {...props}
      value={value}
      onChange={setValue}
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
              onClear: isClearVisible
                ? () => {
                    setValue("");
                    onClear?.();
                  }
                : undefined,
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
