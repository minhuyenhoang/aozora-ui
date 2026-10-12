import type { ReactNode } from "react";
import { IconGripVertical } from "@tabler/icons-react";
import type { GridListItemProps as AriaGridListItemProps } from "react-aria-components";
import {
  Button as AriaButton,
  GridListItem as AriaGridListItem,
} from "react-aria-components";
import { Checkbox } from "../../control/Checkbox";
import { cx } from "@styles/utils";
import { useGridListContext } from "./GridListContext";

export interface GridListItemProps<T = object> extends Omit<
  AriaGridListItemProps<T>,
  "children" | "textValue"
> {
  /** The primary content of the item. */
  label: ReactNode;
  /** A string representation used for typeahead and accessibility. */
  textValue?: string;
  /** Optional secondary content displayed below the label. */
  description?: ReactNode;
  /** Optional icon displayed before the label. */
  icon?: ReactNode;
  /** Optional content aligned to the end of the row. */
  trailingContent?: ReactNode;
  /** Overrides the list-level checkbox visibility for this item. */
  showCheckbox?: boolean;
  /** Hides the drag handle of this item when set to `false`. */
  showDragHandle?: boolean;
}

/** Row spacing and text sizes for each grid list size. */
const sizes = {
  sm: {
    row: "min-h-9 gap-2 px-2 py-1.5",
    label: "text-sm",
    description: "text-xs",
    icon: "size-4",
  },
  md: {
    row: "min-h-11 gap-2.5 px-2.5 py-2",
    label: "text-md",
    description: "text-sm",
    icon: "size-5",
  },
};

/** A grid list row with optional drag handle, checkbox, icon and description. */
export function GridListItem<T = object>({
  label,
  textValue: textValueProp,
  description,
  icon,
  trailingContent,
  showCheckbox,
  showDragHandle = true,
  className,
  ...props
}: GridListItemProps<T>) {
  const { showCheckboxes, size } = useGridListContext();
  const itemSize = sizes[size];
  // Falls back to the label, then the id, when no text value is given.
  const textValue =
    textValueProp ??
    (typeof label === "string" ? label : String(props.id ?? ""));

  return (
    <AriaGridListItem
      {...props}
      textValue={textValue}
      className={(state) =>
        cx(
          "relative flex w-full min-w-0 items-center rounded-md text-secondary outline-hidden transition duration-100 ease-linear select-none",
          itemSize.row,
          state.selectionMode !== "none" && "cursor-pointer",
          state.isSelected && "bg-active",
          (state.isHovered || state.isFocused) &&
            !state.isDisabled &&
            "bg-primary_hover text-secondary_hover",
          state.isFocusVisible && "ring-2 ring-focus-ring ring-inset",
          state.isDropTarget &&
            "bg-brand-primary_alt ring-2 ring-brand ring-inset",
          state.isDragging && "opacity-50",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({
        allowsDragging,
        id,
        isDisabled,
        isSelected,
        selectionBehavior,
        selectionMode,
        state,
      }) => {
        // Checkboxes only make sense when rows can be toggled.
        const hasCheckbox =
          (showCheckbox ?? showCheckboxes) &&
          selectionMode !== "none" &&
          selectionBehavior === "toggle";

        return (
          <>
            {allowsDragging && showDragHandle && (
              <AriaButton
                slot="drag"
                aria-label={`Drag ${textValue}`}
                className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-fg-quaternary outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <IconGripVertical aria-hidden="true" className="size-4" />
              </AriaButton>
            )}

            {hasCheckbox && id != null && (
              <Checkbox
                slot={null}
                aria-label={`Select ${textValue}`}
                isDisabled={
                  isDisabled || !state.selectionManager.canSelectItem(id)
                }
                isSelected={isSelected}
                onChange={() => state.selectionManager.toggleSelection(id)}
                size="sm"
                className="shrink-0"
              />
            )}

            {icon && (
              <span
                aria-hidden="true"
                className={cx(
                  "flex shrink-0 items-center justify-center text-fg-quaternary [&>svg]:size-full",
                  itemSize.icon,
                )}
              >
                {icon}
              </span>
            )}

            <span className="flex min-w-0 flex-1 flex-col">
              <span className={cx("truncate font-medium", itemSize.label)}>
                {label}
              </span>
              {description && (
                <span
                  className={cx("truncate text-tertiary", itemSize.description)}
                >
                  {description}
                </span>
              )}
            </span>

            {trailingContent && (
              <span className="shrink-0 text-tertiary">{trailingContent}</span>
            )}
          </>
        );
      }}
    </AriaGridListItem>
  );
}
