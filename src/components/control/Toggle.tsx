import type { ReactNode } from "react";
import {
  SwitchButton as AriaSwitchBase,
  SwitchField as AriaSwitchField,
  type SwitchFieldProps as AriaSwitchFieldProps,
  Text as AriaText,
} from "react-aria-components";
import { cx } from "@styles/utils";

export interface ToggleThumbProps {
  size?: "sm" | "md";
  slim?: boolean;
  className?: string;
  isHovered?: boolean;
  isFocusVisible?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export function ToggleThumb({
  className,
  isHovered,
  isDisabled,
  isFocusVisible,
  isSelected,
  slim,
  size = "sm",
}: ToggleThumbProps) {
  const styles = {
    default: {
      sm: {
        root: "h-5 w-9 p-0.5",
        switch: cx("size-4", isSelected && "translate-x-4"),
      },
      md: {
        root: "h-6 w-11 p-0.5",
        switch: cx("size-5", isSelected && "translate-x-5"),
      },
    },
    slim: {
      sm: {
        root: "h-4 w-8",
        switch: cx("size-4", isSelected && "translate-x-4"),
      },
      md: {
        root: "h-5 w-10",
        switch: cx("size-5", isSelected && "translate-x-5"),
      },
    },
  };

  const classes = slim ? styles.slim[size] : styles.default[size];

  return (
    <div
      className={cx(
        "cursor-pointer rounded-full bg-tertiary ring-[0.5px] ring-secondary outline-focus-ring transition duration-150 ease-linear ring-inset",
        isSelected && "bg-brand-solid",
        isSelected && isHovered && "bg-brand-solid_hover",
        isDisabled && "cursor-not-allowed opacity-50",
        isFocusVisible && "outline-2 outline-offset-2",

        slim && "ring-1",
        slim && isSelected && "ring-transparent",
        classes.root,
        className,
      )}
    >
      <div
        style={{
          transition:
            "transform 0.15s ease-in-out, translate 0.15s ease-in-out, border-color 0.1s linear, background-color 0.1s linear",
        }}
        className={cx(
          "rounded-full bg-fg-white shadow-sm",

          slim && "shadow-xs",
          slim && "border border-toggle-border",
          slim && isSelected && "border-toggle-slim-border_pressed",
          slim &&
            isSelected &&
            isHovered &&
            "border-toggle-slim-border_pressed-hover",

          classes.switch,
        )}
      />
    </div>
  );
}

const styles = {
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

export interface ToggleProps extends AriaSwitchFieldProps {
  size?: "sm" | "md";
  label?: string;
  description?: ReactNode;
  slim?: boolean;
}

export function Toggle({
  label,
  description,
  className,
  size = "sm",
  slim,
  ...switchFieldProps
}: ToggleProps) {
  return (
    <AriaSwitchField
      {...switchFieldProps}
      className={(state) =>
        cx(
          "relative grid w-max grid-cols-[auto_minmax(0,1fr)] items-start",
          state.isDisabled && "cursor-not-allowed",
          styles[size].root,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <AriaSwitchBase className="contents">
        {({ isSelected, isDisabled, isFocusVisible, isHovered }) => (
          <>
            <ToggleThumb
              slim={slim}
              size={size}
              isHovered={isHovered}
              isDisabled={isDisabled}
              isFocusVisible={isFocusVisible}
              isSelected={isSelected}
              className={cx("col-start-1 row-start-1", slim && "mt-0.5")}
            />

            {label && (
              <span
                className={cx(
                  "col-start-2 row-start-1 text-secondary select-none",
                  styles[size].label,
                )}
              >
                {label}
              </span>
            )}
          </>
        )}
      </AriaSwitchBase>

      {description && (
        <AriaText
          slot="description"
          className={cx(
            "col-start-2 text-tertiary",
            label ? "row-start-2" : "row-start-1",
            styles[size].description,
          )}
        >
          {description}
        </AriaText>
      )}
    </AriaSwitchField>
  );
}
