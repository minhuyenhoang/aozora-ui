import { type ReactNode, useId } from "react";
import type {
  DragAndDropHooks,
  DropTarget,
  GridListProps as AriaGridListProps,
  Key,
} from "react-aria-components";
import {
  DropIndicator as AriaDropIndicator,
  GridList as AriaGridList,
  useDragAndDrop,
} from "react-aria-components";
import { useControlledState } from "react-stately/useControlledState";
import { cx } from "@styles/utils";
import { GridListContext, type GridListSize } from "./GridListContext";
import { GridListEmptyState } from "./GridListEmptyState";

export interface GridListProps<T extends object = object> extends Omit<
  AriaGridListProps<T>,
  "items" | "dragAndDropHooks"
> {
  /** The items of a controlled list. Use together with `onItemsChange`. */
  items?: Iterable<T>;
  /** The initial items of an uncontrolled list. */
  defaultItems?: Iterable<T>;
  /** Called with the new items after a drag and drop changed them. */
  onItemsChange?: (items: T[]) => void;
  /** Returns the key of an item. Defaults to its `id`, then its `key`. */
  getKey?: (item: T) => Key;
  /** Displays a checkbox for each selectable item. */
  showCheckboxes?: boolean;
  /** Controls the row density. */
  size?: GridListSize;
  /**
   * Lets the user reorder the items by dragging them.
   * Requires `items` or `defaultItems`.
   */
  allowsReordering?: boolean;
  /**
   * Lets the user move items between every grid list sharing the same group.
   * Items must be JSON serializable. Requires `items` or `defaultItems`.
   */
  dragGroup?: string;
  /** Prebuilt React Aria drag and drop hooks. Replaces the built-in ones. */
  dragAndDropHooks?: DragAndDropHooks<T>;
}

function defaultGetKey(item: object): Key {
  const { id, key } = item as { id?: Key; key?: Key };
  return (id ?? key) as Key;
}

function defaultRenderEmptyState() {
  return <GridListEmptyState />;
}

/** Places `incoming` before or after the target, removing any stale copies. */
function insertItems<T>(
  items: T[],
  incoming: T[],
  getKey: (item: T) => Key,
  target?: { key: Key; dropPosition: "before" | "after" | "on" },
) {
  const incomingKeys = new Set(incoming.map(getKey));
  const rest = items.filter((item) => !incomingKeys.has(getKey(item)));

  if (!target) return [...rest, ...incoming];

  const targetIndex = rest.findIndex((item) => getKey(item) === target.key);
  // The target is one of the dragged items, so there is nowhere to move to.
  if (targetIndex === -1) return items;

  const index = target.dropPosition === "after" ? targetIndex + 1 : targetIndex;
  return [...rest.slice(0, index), ...incoming, ...rest.slice(index)];
}

export function GridList<T extends object = object>({
  items: itemsProp,
  defaultItems,
  onItemsChange,
  getKey = defaultGetKey,
  showCheckboxes = false,
  size = "sm",
  allowsReordering = false,
  dragGroup,
  dragAndDropHooks,
  selectionMode,
  selectionBehavior,
  renderEmptyState = defaultRenderEmptyState,
  layout,
  className,
  children,
  ...props
}: GridListProps<T>) {
  const id = useId();
  // Without `items` or `defaultItems` the rows are static children.
  const hasItems = itemsProp !== undefined || defaultItems !== undefined;
  const [items, setItems] = useControlledState<T[]>(
    itemsProp === undefined ? undefined : Array.from(itemsProp),
    Array.from(defaultItems ?? []),
    onItemsChange,
  );

  // Lists only accept each other's items when they share a group.
  const dragType =
    `application/x-aozora-grid-list-${dragGroup ?? id}`.toLowerCase();
  const allowsCrossListDragging = dragGroup !== undefined;
  const allowsDragAndDrop =
    hasItems && (allowsReordering || allowsCrossListDragging);

  async function readItems(dropItems: Iterable<unknown>) {
    const incoming: T[] = [];

    for (const dropItem of dropItems as Iterable<{
      kind: string;
      types?: Set<string>;
      getText?: (type: string) => Promise<string>;
    }>) {
      if (dropItem.kind !== "text" || !dropItem.types?.has(dragType)) continue;
      incoming.push(JSON.parse(await dropItem.getText!(dragType)) as T);
    }

    return incoming;
  }

  function renderDropIndicator(target: DropTarget) {
    return (
      <AriaDropIndicator
        target={target}
        className={(state) =>
          cx(
            "z-20 shrink-0 rounded-full bg-brand-solid outline-hidden transition-opacity",
            // The negative margin cancels out the extra gap the indicator adds.
            layout === "grid" ? "-mx-[3px] w-0.5" : "-my-[3px] h-0.5",
            state.isDropTarget ? "opacity-100" : "opacity-0",
          )
        }
      />
    );
  }

  const builtIn = useDragAndDrop<T>({
    isDisabled: !allowsDragAndDrop,
    getItems: (_keys, draggedItems) =>
      draggedItems.map((item) => ({ [dragType]: JSON.stringify(item) })),
    getAllowedDropOperations: () => ["move"],
    acceptedDragTypes: [dragType],
    renderDropIndicator,
    onReorder: allowsReordering
      ? (event) => {
          // Drops resolve asynchronously, so every update starts from the
          // latest items instead of the ones captured by this render.
          setItems((current) =>
            insertItems(
              current,
              current.filter((item) => event.keys.has(getKey(item))),
              getKey,
              event.target,
            ),
          );
        }
      : undefined,
    onInsert: allowsCrossListDragging
      ? async (event) => {
          const incoming = await readItems(event.items);
          setItems((current) =>
            insertItems(current, incoming, getKey, event.target),
          );
        }
      : undefined,
    onRootDrop: allowsCrossListDragging
      ? async (event) => {
          const incoming = await readItems(event.items);
          setItems((current) => insertItems(current, incoming, getKey));
        }
      : undefined,
    // Items that were moved to another list are removed from this one.
    onDragEnd: allowsCrossListDragging
      ? (event) => {
          if (event.dropOperation !== "move" || event.isInternal) return;
          setItems((current) =>
            current.filter((item) => !event.keys.has(getKey(item))),
          );
        }
      : undefined,
  });

  return (
    <GridListContext.Provider value={{ showCheckboxes, size }}>
      <AriaGridList
        {...props}
        items={hasItems ? items : undefined}
        layout={layout}
        selectionMode={selectionMode ?? (showCheckboxes ? "multiple" : "none")}
        selectionBehavior={selectionBehavior ?? "toggle"}
        dragAndDropHooks={
          dragAndDropHooks ??
          (allowsDragAndDrop ? builtIn.dragAndDropHooks : undefined)
        }
        renderEmptyState={renderEmptyState}
        className={(state) =>
          cx(
            "flex w-full min-w-0 gap-1 rounded-md outline-hidden",
            state.layout === "grid" ? "flex-row flex-wrap" : "flex-col",
            state.isFocusVisible && "ring-2 ring-focus-ring",
            state.isDropTarget &&
              "bg-brand-primary_alt ring-2 ring-brand ring-inset",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {children as ReactNode | ((item: T) => ReactNode)}
      </AriaGridList>
    </GridListContext.Provider>
  );
}
