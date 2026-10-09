import {
  type FC,
  type ReactNode,
  type Ref,
  isValidElement,
} from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Button as AriaButton,
  SelectValue as AriaSelectValue,
} from "react-aria-components";
import { Avatar } from "../../media/avatar/Avatar";
import { cx } from "@styles/utils";
import { isReactComponent } from "@utils/componentCheck";
import { selectSizes } from "../constants";
import type { SelectItemType } from "../types";

export interface SelectValueProps {
  isOpen: boolean;
  size: "sm" | "md" | "lg";
  isFocused: boolean;
  isDisabled: boolean;
  placeholder?: string;
  ref?: Ref<HTMLButtonElement>;
  icon?: FC | ReactNode;
}

export function SelectValue({
  isOpen,
  isFocused,
  isDisabled,
  size,
  placeholder,
  icon,
  ref,
}: SelectValueProps) {
  return (
    <AriaButton
      ref={ref}
      className={cx(
        "relative flex w-full cursor-pointer items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset",
        (isFocused || isOpen) && "ring-2 ring-brand",
        isDisabled && "cursor-not-allowed opacity-50",
      )}
    >
      <AriaSelectValue<SelectItemType>
        className={(state) =>
          cx(
            "flex h-max w-full items-center justify-start truncate text-left align-middle",

            selectSizes[size].root,

            // With icon
            (state.selectedItems[0]?.icon || icon) &&
              selectSizes[size].withIcon,

            // Icon styles
            "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary",
          )
        }
      >
        {(state) => {
          const selectedItem = state.selectedItems[0];
          const Icon = selectedItem?.icon || icon;

          return (
            <>
              {selectedItem?.avatarUrl ? (
                <Avatar
                  size="xs"
                  src={selectedItem.avatarUrl}
                  alt={selectedItem.label}
                  className={cx(size === "sm" && "size-5")}
                />
              ) : isReactComponent(Icon) ? (
                <Icon data-icon aria-hidden="true" />
              ) : isValidElement(Icon) ? (
                Icon
              ) : null}

              {selectedItem ? (
                <section
                  className={cx(
                    "flex w-full truncate",
                    selectSizes[size].textContainer,
                  )}
                >
                  <p
                    className={cx(
                      "truncate font-medium text-primary",
                      selectSizes[size].text,
                    )}
                  >
                    {selectedItem.label}
                  </p>

                  {selectedItem.supportingText && (
                    <p className={cx("text-tertiary", selectSizes[size].text)}>
                      {selectedItem.supportingText}
                    </p>
                  )}
                </section>
              ) : (
                <p className={cx("text-placeholder", selectSizes[size].text)}>
                  {placeholder}
                </p>
              )}

              <IconChevronDown
                aria-hidden="true"
                className={cx(
                  "ml-auto shrink-0 text-fg-quaternary",
                  size === "lg" ? "size-5" : "size-4 stroke-[2.25px]",
                )}
              />
            </>
          );
        }}
      </AriaSelectValue>
    </AriaButton>
  );
}
