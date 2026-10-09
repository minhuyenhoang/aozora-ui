import {
  type ComponentType,
  type HTMLAttributes,
  type Ref,
  useState,
} from "react";
import {
  IconEye,
  IconEyeOff,
  IconHelpCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { InputProps as AriaInputProps } from "react-aria-components";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
} from "react-aria-components";
import { Tooltip } from "../../overlay/Tooltip";
import { OverlayTrigger } from "../../overlay/OverlayTrigger";
import { useTextFieldContext } from "./TextFieldContext";
import { cx, sortCx } from "@styles/utils";

export interface InputBaseProps extends Omit<AriaInputProps, "size"> {
  /** Tooltip message on hover. */
  tooltip?: string;
  /** Whether the input is invalid. */
  isInvalid?: boolean;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input is required. */
  isRequired?: boolean;
  /**
   * Input size.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /** Placeholder text. */
  placeholder?: string;
  /** Class name for the icon. */
  iconClassName?: string;
  /** Class name for the input. */
  inputClassName?: string;
  /** Class name for the input wrapper. */
  wrapperClassName?: string;
  /** Class name for the tooltip. */
  tooltipClassName?: string;
  /** Keyboard shortcut to display. */
  shortcut?: string | boolean;
  ref?: Ref<HTMLInputElement>;
  groupRef?: Ref<HTMLDivElement>;
  /** Icon component to display on the left side of the input. */
  icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
}

export function InputBase({
  ref,
  tooltip,
  shortcut,
  groupRef,
  size = "md",
  isInvalid,
  isDisabled,
  isRequired,
  icon: Icon,
  placeholder,
  wrapperClassName,
  tooltipClassName,
  inputClassName,
  iconClassName,
  type = "text",
  ...inputProps
}: InputBaseProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Check if the input has a leading icon or tooltip
  const hasTrailingIcon = tooltip || isInvalid;
  const hasLeadingIcon = Icon;

  // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
  const context = useTextFieldContext();

  const inputSize = context?.size || size;

  const sizes = sortCx({
    sm: {
      root: cx(
        "px-3 py-2 text-sm",
        hasLeadingIcon && "pl-9",
        hasTrailingIcon && "pr-9",
      ),
      iconLeading: "left-3 size-4 stroke-[2.25px]",
      iconTrailing: "right-3",
      shortcut: "pr-1.5",
    },
    md: {
      root: cx(
        "px-3 py-2 text-md",
        hasLeadingIcon && "pl-10",
        hasTrailingIcon && "pr-9",
      ),
      iconLeading: "left-3 size-5",
      iconTrailing: "right-3",
      shortcut: "pr-2",
    },
    lg: {
      root: cx(
        "px-3.5 py-2.5 text-md",
        hasLeadingIcon && "pl-10.5",
        hasTrailingIcon && "pr-9.5",
      ),
      iconLeading: "left-3.5 size-5",
      iconTrailing: "right-3.5",
      shortcut: "pr-2.5",
    },
  });

  return (
    <AriaGroup
      {...{ isDisabled, isInvalid }}
      ref={groupRef}
      className={({ isFocusWithin, isDisabled, isInvalid }) =>
        cx(
          "group/input relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",

          isFocusWithin && !isDisabled && "ring-2 ring-brand",

          // Disabled state styles
          isDisabled && "cursor-not-allowed opacity-50",
          "group-disabled:cursor-not-allowed group-disabled:opacity-50",

          // Invalid state styles
          isInvalid && "ring-destructive_subtle",
          "group-invalid:ring-destructive_subtle",

          // Invalid state with focus-within styles
          isInvalid && isFocusWithin && "ring-2 ring-destructive",
          isFocusWithin && "group-invalid:ring-2 group-invalid:ring-destructive",

          context?.wrapperClassName,
          wrapperClassName,
        )
      }
    >
      {/* Leading icon and Payment icon */}
      {Icon && (
        <Icon
          className={cx(
            "pointer-events-none absolute text-fg-quaternary",
            sizes[inputSize].iconLeading,
            context?.iconClassName,
            iconClassName,
          )}
        />
      )}

      {/* Input field */}
      <AriaInput
        {...(inputProps as AriaInputProps)}
        ref={ref}
        required={isRequired}
        type={type === "password" && isPasswordVisible ? "text" : type}
        placeholder={placeholder}
        className={cx(
          "m-0 w-full bg-transparent text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary disabled:cursor-not-allowed",
          sizes[inputSize].root,
          context?.inputClassName,
          inputClassName,
        )}
      />

      {/* Tooltip and help icon */}
      {tooltip && type !== "password" && (
        <Tooltip title={tooltip} placement="top">
          <OverlayTrigger
            className={cx(
              "absolute cursor-pointer text-fg-quaternary transition duration-100 ease-linear group-invalid/input:hidden hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
              sizes[inputSize].iconTrailing,
              context?.tooltipClassName,
              tooltipClassName,
            )}
          >
            <IconHelpCircle className="size-4 stroke-[2.25px]" />
          </OverlayTrigger>
        </Tooltip>
      )}

      {/* Invalid icon */}
      {type !== "password" && (
        <IconInfoCircle
          className={cx(
            "pointer-events-none absolute hidden size-4 stroke-[2.25px] text-fg-destructive-secondary group-invalid/input:block",
            sizes[inputSize].iconTrailing,
            context?.tooltipClassName,
            tooltipClassName,
          )}
        />
      )}

      {/* Password visibility toggle */}
      {type === "password" && (
        <AriaButton
          aria-label="Toggle password visibility"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className={cx(
            "absolute flex cursor-pointer items-center justify-center text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover focus:outline-hidden",
            sizes[inputSize].iconTrailing,
          )}
        >
          {isPasswordVisible ? (
            <IconEyeOff className="size-4 stroke-[2.25px]" />
          ) : (
            <IconEye className="size-4 stroke-[2.25px]" />
          )}
        </AriaButton>
      )}

      {/* Shortcut */}
      {shortcut && (
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex",
            sizes[inputSize].shortcut,
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset"
          >
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      )}
    </AriaGroup>
  );
}
