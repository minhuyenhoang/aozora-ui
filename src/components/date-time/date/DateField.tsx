import type { ReactNode } from "react";
import type { DateFieldProps as AriaDateFieldProps } from "react-aria-components";
import {
  DateField as AriaDateField,
  type DateValue,
} from "react-aria-components";
import {
  DateFieldBase,
  type DateFieldBaseProps,
} from "../../base/date-time/DateFieldBase";
import { DescriptionText } from "../../base/DescriptionText";
import { Label } from "../../base/Label";
import { cx } from "@styles/utils";

export interface DateFieldProps
  extends
    Omit<AriaDateFieldProps<DateValue>, "isRequired">,
    Pick<
      DateFieldBaseProps,
      | "ref"
      | "size"
      | "placeholder"
      | "icon"
      | "shortcut"
      | "tooltip"
      | "groupRef"
      | "iconClassName"
      | "wrapperClassName"
      | "tooltipClassName"
    > {
  /** Label text for the input. */
  label?: string;
  /** Helper text displayed below the input. */
  description?: ReactNode;
  /** Whether the field is required and shows the required indicator. */
  required?: boolean;
  /** Class name for the input. */
  inputClassName?: string;
}

export function DateField({
  size = "md",
  placeholder,
  icon: Icon,
  label,
  description,
  shortcut,
  required,
  className,
  ref,
  groupRef,
  tooltip,
  iconClassName,
  inputClassName,
  wrapperClassName,
  tooltipClassName,
  ...props
}: DateFieldProps) {
  return (
    <AriaDateField
      {...props}
      isRequired={required}
      className={(state) =>
        cx(
          "group flex h-max w-full flex-col items-start justify-start gap-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isInvalid, state }) => (
        <>
          {label && (
            <Label isRequired={state.isRequired}>
              {label}
            </Label>
          )}

          <DateFieldBase
            className={inputClassName}
            {...{
              ref,
              groupRef,
              size,
              placeholder,
              icon: Icon,
              shortcut,
              iconClassName,
              wrapperClassName,
              tooltipClassName,
              tooltip,
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
    </AriaDateField>
  );
}
