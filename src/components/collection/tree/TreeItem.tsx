import type { ReactNode } from "react";
import { IconChevronRight, IconGripVertical } from "@tabler/icons-react";
import type { TreeItemProps as AriaTreeItemProps } from "react-aria-components";
import {
  Button as AriaButton,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { TreeCheckbox } from "./TreeCheckbox";
import { useTreeContext } from "./TreeContext";
import { TreeLines } from "./TreeLines";

export interface TreeItemProps<T = object> extends Omit<
  AriaTreeItemProps<T>,
  "children" | "textValue"
> {
  /** The primary content of the tree item. */
  label: ReactNode;
  /** A string representation used for typeahead and accessibility. */
  textValue?: string;
  /** Optional secondary content displayed after the label. */
  description?: ReactNode;
  /** Optional icon: an element, or a function receiving `isExpanded`. */
  icon?: ReactNode | ((props: { isExpanded: boolean }) => ReactNode);
  /** Optional content aligned to the end of the row. */
  trailingContent?: ReactNode;
  /** Nested tree items. */
  children?: ReactNode;
  /** Overrides the tree-level checkbox visibility for this item. */
  showCheckbox?: boolean;
  /** Class name for the styled content inside the tree row. */
  contentClassName?: string;
}

/** Row spacing, text sizes and indentation for each tree size. */
const sizes = {
  sm: {
    row: "min-h-8 gap-2 py-1.5 pr-2",
    label: "text-sm",
    description: "text-xs",
    icon: "size-4",
    indent: 24,
    offset: 4,
  },
  md: {
    row: "min-h-10 gap-2.5 py-2 pr-2.5",
    label: "text-md",
    description: "text-sm",
    icon: "size-5",
    indent: 28,
    offset: 6,
  },
};

/** Shared look of the small chevron and drag buttons. */
const iconButton =
  "relative z-10 flex size-5 shrink-0 items-center justify-center rounded text-fg-quaternary outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring";

/** A tree row with optional checkbox, icon, description and drag handle. */
export function TreeItem<T = object>({
  label,
  textValue: textValueProp,
  description,
  icon,
  trailingContent,
  children,
  showCheckbox,
  contentClassName,
  className,
  ...props
}: TreeItemProps<T>) {
  const { showCheckboxes, showLines, size } = useTreeContext();
  const itemSize = sizes[size];
  // Falls back to the label, then the id, when no text value is given.
  const textValue =
    textValueProp ??
    (typeof label === "string" ? label : String(props.id ?? ""));

  return (
    <AriaTreeItem
      {...props}
      textValue={textValue}
      className={(state) =>
        cx(
          "relative w-full outline-hidden",
          state.isDragging && "opacity-50",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <AriaTreeItemContent>
        {({
          allowsDragging,
          hasChildItems,
          id,
          isDisabled,
          isDropTarget,
          isExpanded,
          isFocused,
          isFocusVisible,
          isHovered,
          isSelected,
          level,
          selectionBehavior,
          selectionMode,
          state,
        }) => {
          // Checkboxes only make sense when rows can be toggled.
          const hasCheckbox =
            (showCheckbox ?? showCheckboxes) &&
            selectionMode !== "none" &&
            selectionBehavior === "toggle";
          const resolvedIcon =
            typeof icon === "function" ? icon({ isExpanded }) : icon;

          return (
            <div
              className={cx(
                "relative flex w-full items-center rounded-md text-secondary transition duration-100 ease-linear select-none",
                itemSize.row,
                (isHovered || isFocused) &&
                  !isSelected &&
                  !isDisabled &&
                  "bg-primary_hover text-secondary_hover",
                isFocusVisible && "ring-2 ring-focus-ring ring-inset",
                isDropTarget &&
                  "bg-brand-primary_alt ring-2 ring-brand ring-inset",
                contentClassName,
              )}
              style={{
                paddingInlineStart:
                  itemSize.offset + (level - 1) * itemSize.indent,
              }}
            >
              {showLines && (
                <TreeLines
                  hasChildItems={hasChildItems}
                  id={id}
                  indent={itemSize.indent}
                  isExpanded={isExpanded}
                  level={level}
                  offset={itemSize.offset}
                  state={state}
                />
              )}

              {hasChildItems ? (
                <AriaButton
                  slot="chevron"
                  className={cx(
                    iconButton,
                    "cursor-pointer hover:text-fg-quaternary_hover",
                  )}
                >
                  <IconChevronRight
                    aria-hidden="true"
                    className={cx(
                      "size-4 transition-transform duration-150",
                      isExpanded && "rotate-90",
                    )}
                  />
                </AriaButton>
              ) : (
                <span className="size-5 shrink-0" />
              )}

              {hasCheckbox && (
                <div className="relative z-10 flex shrink-0">
                  <TreeCheckbox id={id} label={textValue} state={state} />
                </div>
              )}

              {resolvedIcon && (
                <span
                  aria-hidden="true"
                  className={cx(
                    "relative z-10 flex shrink-0 items-center justify-center text-fg-quaternary [&>svg]:size-full",
                    itemSize.icon,
                  )}
                >
                  {resolvedIcon}
                </span>
              )}

              <span className="relative z-10 flex min-w-0 flex-1 items-baseline gap-2">
                <span className={cx("truncate font-medium", itemSize.label)}>
                  {label}
                </span>
                {description && (
                  <span
                    className={cx(
                      "truncate text-tertiary",
                      itemSize.description,
                    )}
                  >
                    {description}
                  </span>
                )}
              </span>

              {trailingContent && (
                <span className="relative z-10 shrink-0 text-tertiary">
                  {trailingContent}
                </span>
              )}

              {allowsDragging && (
                <AriaButton
                  slot="drag"
                  aria-label={`Drag ${textValue}`}
                  className={cx(iconButton, "cursor-grab")}
                >
                  <IconGripVertical aria-hidden="true" className="size-4" />
                </AriaButton>
              )}
            </div>
          );
        }}
      </AriaTreeItemContent>
      {children}
    </AriaTreeItem>
  );
}
