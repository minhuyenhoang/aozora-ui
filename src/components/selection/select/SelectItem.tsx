import { isValidElement, useContext } from "react";
import { IconCheck } from "@tabler/icons-react";
import type { ListBoxItemProps as AriaListBoxItemProps } from "react-aria-components";
import {
  ListBoxItem as AriaListBoxItem,
  Text as AriaText,
} from "react-aria-components";
import { Avatar } from "../../media/avatar/Avatar";
import { cx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { SelectContext } from "./SelectContext";
import type { SelectItemType } from "../types";

const sizes = {
  sm: {
    root: "gap-2 p-2 pr-2.5 *:data-icon:size-4 *:data-icon:stroke-[2.25px]",
    text: "text-sm",
    textContainer: "gap-x-1.5",
    check: "size-4 stroke-[2.25px]",
    checkbox: "sm" as const,
  },
  md: {
    root: "gap-2 p-2 pr-2.5 *:data-icon:size-5",
    text: "text-md",
    textContainer: "gap-x-2",
    check: "size-5",
    checkbox: "sm" as const,
  },
  lg: {
    root: "gap-2 p-2.5 pl-2 *:data-icon:size-5",
    text: "text-md",
    textContainer: "gap-x-2",
    check: "size-5",
    checkbox: "md" as const,
  },
};

interface SelectionCheckboxProps {
  size: "sm" | "md";
  isSelected: boolean;
  isDisabled: boolean;
  className?: string;
}

function SelectionCheckbox({
  size,
  isSelected,
  isDisabled,
  className,
}: SelectionCheckboxProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "relative flex size-4 shrink-0 items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset",
        size === "md" && "size-5 rounded-md",
        isSelected && "bg-brand-solid ring-brand-solid",
        isDisabled && "opacity-50",
        isDisabled && !isSelected && "bg-tertiary",
        className,
      )}
    >
      {isSelected && (
        <IconCheck
          className={cx(
            "pointer-events-none size-3 text-fg-white",
            size === "md" && "size-3.5",
          )}
        />
      )}
    </div>
  );
}

export interface SelectItemProps
  extends Omit<AriaListBoxItemProps<SelectItemType>, "id">, SelectItemType {
  /** The selection indicator to be displayed on the item. */
  selectionIndicator?: "checkmark" | "checkbox" | "none";
  /** The alignment of the selection indicator. */
  selectionIndicatorAlign?: "left" | "right";
}

export function SelectItem({
  label,
  id,
  value,
  avatarUrl,
  supportingText,
  isDisabled,
  icon: Icon,
  className,
  children,
  selectionIndicator = "checkmark",
  selectionIndicatorAlign = "right",
  ...props
}: SelectItemProps) {
  const { size } = useContext(SelectContext);

  const labelOrChildren =
    label || (typeof children === "string" ? children : "");
  const textValue = supportingText
    ? labelOrChildren + " " + supportingText
    : labelOrChildren;
  const isLeft = selectionIndicatorAlign === "left";

  return (
    <AriaListBoxItem
      id={id}
      value={
        value ?? {
          id,
          label: labelOrChildren,
          avatarUrl,
          supportingText,
          isDisabled,
          icon: Icon,
        }
      }
      textValue={textValue}
      isDisabled={isDisabled}
      {...props}
      className={(state) =>
        cx(
          "w-full py-px outline-hidden",
          size === "sm" ? "px-1" : "px-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <div
          className={cx(
            "flex cursor-pointer items-center rounded-md outline-hidden select-none",
            (state.isFocused ||
              state.isHovered ||
              (state.isSelected && selectionIndicator !== "checkbox")) &&
              "bg-primary_hover",
            state.isDisabled && "cursor-not-allowed opacity-50",
            state.isFocusVisible && "ring-2 ring-focus-ring ring-inset",
            "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary",
            sizes[size].root,
          )}
        >
          {isLeft && selectionIndicator === "checkbox" && (
            <SelectionCheckbox
              size={sizes[size].checkbox}
              isSelected={state.isSelected}
              isDisabled={state.isDisabled}
            />
          )}

          {avatarUrl ? (
            <Avatar
              size="xs"
              src={avatarUrl}
              alt={label}
              className={cx(size === "sm" && "size-5")}
            />
          ) : isReactComponent(Icon) ? (
            <Icon data-icon aria-hidden="true" />
          ) : isValidElement(Icon) ? (
            Icon
          ) : null}

          <div
            className={cx(
              "flex w-full min-w-0 flex-1 flex-wrap",
              sizes[size].textContainer,
            )}
          >
            <AriaText
              slot="label"
              className={cx(
                "truncate font-medium whitespace-nowrap text-primary",
                sizes[size].text,
              )}
            >
              {label ||
                (typeof children === "function" ? children(state) : children)}
            </AriaText>

            {supportingText && (
              <AriaText
                slot="description"
                className={cx(
                  "whitespace-nowrap text-tertiary",
                  sizes[size].text,
                )}
              >
                {supportingText}
              </AriaText>
            )}
          </div>

          {state.isSelected && selectionIndicator === "checkmark" && (
            <IconCheck
              aria-hidden="true"
              className={cx("ml-auto text-success-primary", sizes[size].check)}
            />
          )}

          {!isLeft && selectionIndicator === "checkbox" && (
            <SelectionCheckbox
              size={sizes[size].checkbox}
              isSelected={state.isSelected}
              isDisabled={state.isDisabled}
              className="ml-auto"
            />
          )}
        </div>
      )}
    </AriaListBoxItem>
  );
}
