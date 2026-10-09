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
  const generatedId = useId();
  const inputId = radioFieldProps.id ?? generatedId;

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
      id={inputId}
      className={(state) =>
        cx(
          "relative grid grid-cols-[auto_minmax(0,1fr)] items-start",
          state.isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          sizes[size].root,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <AriaRadioButton className="contents">
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
          </>
        )}
      </AriaRadioButton>
      {label && (
        <label
          htmlFor={inputId}
          className={cx(
            "col-start-2 row-start-1 text-secondary select-none",
            sizes[size].label,
          )}
        >
          {label}
        </label>
      )}

      {description && (
        <AriaText
          slot="description"
          className={cx(
            "col-start-2 text-tertiary",
            label ? "row-start-2" : "row-start-1",
            sizes[size].description,
          )}
        >
          {description}
        </AriaText>
      )}
    </AriaRadioField>
  );
}
