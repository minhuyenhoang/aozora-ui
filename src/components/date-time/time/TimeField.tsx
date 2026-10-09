import type { ReactNode } from "react";
import type { TimeFieldProps as AriaTimeFieldProps } from "react-aria-components";
import {
  TimeField as AriaTimeField,
  type TimeValue,
} from "react-aria-components";
import {
  DateFieldBase,
  type DateFieldBaseProps,
} from "../../base/date-time/DateFieldBase";
import { DescriptionText } from "../../base/DescriptionText";
import { Label } from "../../base/Label";
import { cx } from "@styles/utils";

export interface TimeFieldProps
  extends
    AriaTimeFieldProps<TimeValue>,
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
  /** Whether to hide the required indicator from the label. */
  hideRequiredIndicator?: boolean;
  /** Class name for the input. */
  inputClassName?: string;
}

export function TimeField({
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
  ...props
}: TimeFieldProps) {
  return (
    <AriaTimeField
      {...props}
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
            <Label
              isRequired={
                hideRequiredIndicator
                  ? !hideRequiredIndicator
                  : state.isRequired
              }
              isInvalid={isInvalid}
            >
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
    </AriaTimeField>
  );
}
