import type { ReactNode } from "react";
import type {
  DragAndDropHooks,
  DragAndDropOptions,
  DropTarget,
  TreeProps as AriaTreeProps,
} from "react-aria-components";
import { Tree as AriaTree, useDragAndDrop } from "react-aria-components";
import { cx } from "@styles/utils";
import { TreeContext, type TreeSize } from "./TreeContext";
import { TreeDropIndicator } from "./TreeDropIndicator";

export interface TreeProps<T extends object = object> extends Omit<
  AriaTreeProps<T>,
  "dragAndDropHooks"
> {
  /** Displays a checkbox for each selectable tree item. */
  showCheckboxes?: boolean;
  /** Displays hierarchy connector lines between nested items. */
  showLines?: boolean;
  /** Controls the row density. */
  size?: TreeSize;
  /** Options passed to React Aria's useDragAndDrop hook. */
  dragAndDropOptions?: DragAndDropOptions<T>;
  /** Prebuilt React Aria drag and drop hooks. */
  dragAndDropHooks?: DragAndDropHooks<T>;
}

interface TreeProviderProps {
  children: ReactNode;
  showCheckboxes: boolean;
  showLines: boolean;
  size: TreeSize;
}

function renderDropIndicator(target: DropTarget) {
  return <TreeDropIndicator target={target} />;
}

function TreeProvider({
  children,
  showCheckboxes,
  showLines,
  size,
}: TreeProviderProps) {
  return (
    <TreeContext.Provider value={{ showCheckboxes, showLines, size }}>
      {children}
    </TreeContext.Provider>
  );
}

export function Tree<T extends object = object>({
  showCheckboxes = false,
  showLines = false,
  size = "sm",
  dragAndDropOptions,
  dragAndDropHooks,
  selectionMode,
  selectionBehavior,
  className,
  children,
  ...props
}: TreeProps<T>) {
  const generatedDragAndDrop = useDragAndDrop<T>(
    dragAndDropOptions
      ? {
          ...dragAndDropOptions,
          renderDropIndicator:
            dragAndDropOptions.renderDropIndicator ?? renderDropIndicator,
        }
      : { isDisabled: true },
  );
  const resolvedDragAndDropHooks =
    dragAndDropHooks ??
    (dragAndDropOptions ? generatedDragAndDrop.dragAndDropHooks : undefined);

  return (
    <TreeProvider
      showCheckboxes={showCheckboxes}
      showLines={showLines}
      size={size}
    >
      <AriaTree
        {...props}
        selectionMode={selectionMode ?? (showCheckboxes ? "multiple" : "none")}
        selectionBehavior={selectionBehavior ?? "toggle"}
        dragAndDropHooks={resolvedDragAndDropHooks}
        className={(state) =>
          cx(
            "flex w-full min-w-0 flex-col outline-hidden",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {children}
      </AriaTree>
    </TreeProvider>
  );
}
