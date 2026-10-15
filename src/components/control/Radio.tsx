import { type ReactNode, type Ref, useContext, useId } from "react";
import {
  RadioButton as AriaRadioButton,
  RadioField as AriaRadioField,
  type RadioFieldProps as AriaRadioFieldProps,
  Text as AriaText,
} from "react-aria-components";
import { RadioGroupContext } from "./group/RadioGroupContext";
import { cx } from "@styles/utils";

export interface RadioProps extends AriaRadioFieldProps {
  size?: "sm" | "md";
  label?: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Radio({
  label,
  description,
  className,
  size = "sm",
  ...radioFieldProps
}: RadioProps) {
  const context = useContext(RadioGroupContext);
  const labelId = useId();

  size = context?.size ?? size;

  const sizes = {
    sm: {
      root: "gap-x-2",
      label: "text-sm font-medium",
      description: "text-sm",
    },
    md: {
      root: "gap-x-3 gap-y-0.5",
      label: "text-md font-medium",
      description: "text-md",
    },
  };

  return (
    <AriaRadioField
      {...radioFieldProps}
      // Names the radio by its label alone. The description is inside the
      // clickable area too, and would otherwise be read as part of the name.
      aria-labelledby={
        radioFieldProps["aria-labelledby"] ??
        (label && !radioFieldProps["aria-label"] ? labelId : undefined)
      }
      className={(state) =>
        cx(
          "relative",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {/* The whole row is the clickable area: indicator, label and
          description. */}
      <AriaRadioButton
        className={({ isDisabled }) =>
          cx(
            "grid grid-cols-[auto_minmax(0,1fr)] items-start",
            isDisabled ? "cursor-not-allowed" : "cursor-pointer",
            sizes[size].root,
          )
        }
      >
        {({ isSelected, isDisabled, isFocusVisible }) => (
          <>
            <div
              className={cx(
                "col-start-1 row-start-1 flex size-4 shrink-0 appearance-none items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset",
                size === "md" && "size-5",
                isSelected && "bg-brand-solid ring-brand-solid",
                isDisabled && "opacity-50",
                isDisabled && !isSelected && "bg-tertiary",
                isFocusVisible &&
                  "outline-2 outline-offset-2 outline-focus-ring",
                (label || description) && "mt-0.5",
              )}
            >
              <div
                className={cx(
                  "size-1.5 rounded-full bg-fg-white opacity-0 transition-inherit-all",
                  size === "md" && "size-2",
                  isSelected && "opacity-100",
                )}
              />
            </div>

            {label && (
              <span
                id={labelId}
                className={cx(
                  "col-start-2 row-start-1 text-secondary select-none",
                  sizes[size].label,
                )}
              >
                {label}
              </span>
            )}

            {description && (
              <AriaText
                slot="description"
                className={cx(
                  "col-start-2 text-tertiary select-none",
                  label ? "row-start-2" : "row-start-1",
                  sizes[size].description,
                )}
              >
                {description}
              </AriaText>
            )}
          </>
        )}
      </AriaRadioButton>
    </AriaRadioField>
  );
}
