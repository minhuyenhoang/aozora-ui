import type { FC, ReactNode, RefAttributes } from "react";
import type { SelectProps as AriaSelectProps } from "react-aria-components";
import {
  ListBox as AriaListBox,
  Select as AriaSelect,
} from "react-aria-components";
import { DescriptionText } from "../../base/DescriptionText";
import { Label } from "../../base/Label";
import { cx } from "@styles/utils";
import { Popover } from "../../overlay/Popover";
import type { SelectionCommonProps, SelectItemType } from "../types";
import { SelectContext } from "./SelectContext";
import { SelectValue } from "./SelectValue";

export interface SelectProps
  extends
    Omit<AriaSelectProps<SelectItemType>, "children" | "items">,
    RefAttributes<HTMLDivElement>,
    SelectionCommonProps {
  items?: SelectItemType[];
  popoverClassName?: string;
  icon?: FC | ReactNode;
  children: ReactNode | ((item: SelectItemType) => ReactNode);
}

export function Select({
  placeholder = "Select",
  icon,
  size = "md",
  children,
  items,
  label,
  description,
  tooltip,
  hideRequiredIndicator,
  className,
  ...rest
}: SelectProps) {
  return (
    <SelectContext.Provider value={{ size }}>
      <AriaSelect
        {...rest}
        className={(state) =>
          cx(
            "flex flex-col gap-1.5",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {(state) => (
          <>
            {label && (
              <Label
                isRequired={hideRequiredIndicator ? false : state.isRequired}
                tooltip={tooltip}
              >
                {label}
              </Label>
            )}

            <SelectValue {...state} {...{ size, placeholder }} icon={icon} />

            <Popover size={size} className={rest.popoverClassName}>
              <AriaListBox items={items} className="size-full outline-hidden">
                {children}
              </AriaListBox>
            </Popover>

            {description && (
              <DescriptionText
                isInvalid={state.isInvalid}
                className={cx(size === "sm" && "text-xs")}
              >
                {description}
              </DescriptionText>
            )}
          </>
        )}
      </AriaSelect>
    </SelectContext.Provider>
  );
}
