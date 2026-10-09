import { useContext, type CSSProperties } from "react";
import type { Key, TreeState } from "react-aria-components";
import { DragAndDropContext } from "react-aria-components";

interface TreeLinesProps {
  hasChildItems: boolean;
  id: Key;
  indent: number;
  isExpanded: boolean;
  level: number;
  offset: number;
  state: TreeState<unknown>;
}

function getItemChildren(state: TreeState<unknown>, parentKey: Key) {
  return Array.from(state.collection.getChildren?.(parentKey) ?? []).filter(
    (node) => node.type === "item",
  );
}

function getRootItems(state: TreeState<unknown>) {
  return Array.from(state.collection).filter(
    (node) => node.type === "item" && node.level === 0,
  );
}

function hasNextSibling(state: TreeState<unknown>, id: Key) {
  const item = state.collection.getItem(id);

  if (!item) return false;

  const siblings =
    item.parentKey === null || item.parentKey === undefined
      ? getRootItems(state)
      : getItemChildren(state, item.parentKey);
  const index = siblings.findIndex(({ key }) => key === id);

  return index >= 0 && index < siblings.length - 1;
}

function getAncestorKeys(state: TreeState<unknown>, id: Key) {
  const keys: Key[] = [];
  let item = state.collection.getItem(id);

  while (item?.parentKey !== null && item?.parentKey !== undefined) {
    const parent = state.collection.getItem(item.parentKey);

    if (!parent) break;
    if (parent.type === "item") keys.unshift(parent.key);

    item = parent;
  }

  return keys;
}

/** Gap between the drop indicator and the connector lines of the row below it. */
const DROP_INDICATOR_GAP = 6;

/**
 * Returns the row rendered directly below the "after" drop indicator of `id`.
 * That indicator sits below the item's last visible descendant, so descendants
 * are skipped.
 */
function getRowAfterItem(state: TreeState<unknown>, id: Key) {
  const item = state.collection.getItem(id);

  if (!item) return null;

  let nextKey = state.collection.getKeyAfter(id);

  while (nextKey !== null) {
    const nextItem = state.collection.getItem(nextKey);

    if (nextItem?.type === "item" && nextItem.level <= item.level) {
      return nextItem.key;
    }

    nextKey = state.collection.getKeyAfter(nextKey);
  }

  return null;
}

function getLineStyle(
  depth: number,
  indent: number,
  offset: number,
): CSSProperties {
  return {
    insetInlineStart: offset + (depth - 1) * indent - indent / 2,
  };
}

export function TreeLines({
  hasChildItems,
  id,
  indent,
  isExpanded,
  level,
  offset,
  state,
}: TreeLinesProps) {
  const { dropState } = useContext(DragAndDropContext);
  const ancestorKeys = getAncestorKeys(state, id);
  const currentHasNextSibling = hasNextSibling(state, id);
  const shouldConnectChildren = hasChildItems && isExpanded;
  const dropTarget = dropState?.target;
  const hasDropIndicatorAbove =
    dropTarget?.type === "item" &&
    ((dropTarget.dropPosition === "before" && dropTarget.key === id) ||
      (dropTarget.dropPosition === "after" &&
        getRowAfterItem(state, dropTarget.key) === id));
  const lineTop = hasDropIndicatorAbove ? DROP_INDICATOR_GAP : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -left-0.5"
    >
      {ancestorKeys.map((ancestorKey) => {
        const ancestor = state.collection.getItem(ancestorKey);

        return ancestor &&
          ancestor.level > 0 &&
          hasNextSibling(state, ancestorKey) ? (
          <span
            key={ancestorKey}
            className="absolute bottom-0 border-s border-secondary"
            style={{
              ...getLineStyle(ancestor.level + 1, indent, offset),
              top: lineTop,
            }}
          />
        ) : null;
      })}

      {level > 1 && (
        <span
          className="absolute border-s border-secondary"
          style={{
            ...getLineStyle(level, indent, offset),
            top: lineTop,
            bottom: currentHasNextSibling ? 0 : "50%",
          }}
        />
      )}

      {level > 1 && !currentHasNextSibling && (
        <span
          className="absolute top-1/2 border-t border-secondary"
          style={{
            ...getLineStyle(level, indent, offset),
            width: indent / 2,
          }}
        />
      )}

      {shouldConnectChildren && (
        <span
          className="absolute bottom-0 border-s border-secondary"
          style={{
            ...getLineStyle(level + 1, indent, offset),
            height: "50%",
          }}
        />
      )}
    </div>
  );
}
