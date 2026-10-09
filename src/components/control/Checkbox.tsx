import { type ReactNode, type Ref, useId } from "react";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import {
  CheckboxButton as AriaCheckboxButton,
  CheckboxField as AriaCheckboxField,
  type CheckboxFieldProps as AriaCheckboxFieldProps,
  Text as AriaText,
} from "react-aria-components";
import { cx } from "@styles/utils";

export interface CheckboxProps extends AriaCheckboxFieldProps {
  ref?: Ref<HTMLDivElement>;
  size?: "sm" | "md";
  label?: ReactNode;
  description?: ReactNode;
}

export function Checkbox({
  label,
  description,
  size = "sm",
  className,
  ...checkboxFieldProps
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = checkboxFieldProps.id ?? generatedId;

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
    <AriaCheckboxField
      {...checkboxFieldProps}
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
      <AriaCheckboxButton
        className={({
          isSelected,
          isIndeterminate,
          isDisabled,
          isFocusVisible,
        }) =>
          cx(
            "relative col-start-1 row-start-1 flex size-4 shrink-0 appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset",
            size === "md" && "size-5 rounded-md",
            (isSelected || isIndeterminate) &&
              "bg-brand-solid ring-brand-solid",
            isDisabled && "opacity-50",
            isDisabled &&
              !(isSelected || isIndeterminate) &&
              "bg-tertiary",
            isFocusVisible &&
              "outline-2 outline-offset-2 outline-focus-ring",
            (label || description) && "mt-0.5",
          )
        }
      >
        {({ isSelected, isIndeterminate }) =>
          isIndeterminate ? (
            <IconMinus
              aria-hidden="true"
              className={cx(
                "pointer-events-none size-3 text-fg-white",
                size === "md" && "size-3.5",
              )}
            />
          ) : isSelected ? (
            <IconCheck
              aria-hidden="true"
              className={cx(
                "pointer-events-none size-3 text-fg-white",
                size === "md" && "size-3.5",
              )}
            />
          ) : null
        }
      </AriaCheckboxButton>

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
    </AriaCheckboxField>
  );
}
