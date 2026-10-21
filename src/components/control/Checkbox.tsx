import { type ReactNode, type Ref, useContext, useId } from "react";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import {
  CheckboxButton as AriaCheckboxButton,
  CheckboxField as AriaCheckboxField,
  type CheckboxFieldProps as AriaCheckboxFieldProps,
  Text as AriaText,
} from "react-aria-components";
import { CheckboxGroupContext } from "./group/CheckboxGroupContext";
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
  const context = useContext(CheckboxGroupContext);
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
    <AriaCheckboxField
      {...checkboxFieldProps}
      // Names the checkbox by its label alone. The description is inside the
      // clickable area too, and would otherwise be read as part of the name.
      aria-labelledby={
        checkboxFieldProps["aria-labelledby"] ??
        (label && !checkboxFieldProps["aria-label"] ? labelId : undefined)
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
      <AriaCheckboxButton
        className={({ isDisabled }) =>
          cx(
            "grid grid-cols-[auto_minmax(0,1fr)] items-start",
            isDisabled ? "cursor-not-allowed" : "cursor-pointer",
            sizes[size].root,
          )
        }
      >
        {({ isSelected, isIndeterminate, isDisabled, isFocusVisible }) => (
          <>
            <div
              className={cx(
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
              )}
            >
              {isIndeterminate ? (
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
              ) : null}
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
      </AriaCheckboxButton>
    </AriaCheckboxField>
  );
}
