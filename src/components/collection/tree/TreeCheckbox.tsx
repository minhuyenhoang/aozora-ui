import type { Key, TreeState } from "react-aria-components";
import { Checkbox } from "../../control/Checkbox";

interface TreeCheckboxProps {
  id: Key;
  label: string;
  state: TreeState<unknown>;
}

function getItemChildren(state: TreeState<unknown>, parentKey: Key) {
  return Array.from(state.collection.getChildren?.(parentKey) ?? []).filter(
    (child) => child.type === "item",
  );
}

/**
 * Returns every descendant of the item, plus the subset that are leaves.
 * A branch's checked state is derived from its leaves only, since nested
 * branches have no state of their own.
 */
function getDescendantKeys(state: TreeState<unknown>, id: Key) {
  const keys: Key[] = [];
  const leafKeys: Key[] = [];
  const visitedKeys = new Set<Key>([id]);

  function visit(parentKey: Key) {
    for (const child of getItemChildren(state, parentKey)) {
      if (visitedKeys.has(child.key)) continue;

      visitedKeys.add(child.key);
      keys.push(child.key);

      if (getItemChildren(state, child.key).length === 0) {
        leafKeys.push(child.key);
      }

      visit(child.key);
    }
  }

  visit(id);
  return { keys, leafKeys };
}

export function TreeCheckbox({ id, label, state }: TreeCheckboxProps) {
  const { selectionManager } = state;
  const { keys: descendantKeys, leafKeys } = getDescendantKeys(state, id);
  const selectableDescendantKeys = leafKeys.filter((key) =>
    selectionManager.canSelectItem(key),
  );
  const stateKeys = selectableDescendantKeys.length
    ? selectableDescendantKeys
    : selectionManager.canSelectItem(id)
      ? [id]
      : [];
  const selectedCount = stateKeys.filter((key) =>
    selectionManager.isSelected(key),
  ).length;
  const isSelected = stateKeys.length > 0 && selectedCount === stateKeys.length;
  const isIndeterminate = selectedCount > 0 && !isSelected;

  function handleChange(nextIsSelected: boolean) {
    const nextSelectedKeys = new Set(selectionManager.selectedKeys);
    const subtreeKeys = [id, ...descendantKeys].filter((key) =>
      selectionManager.canSelectItem(key),
    );

    for (const key of subtreeKeys) {
      if (nextIsSelected) {
        nextSelectedKeys.add(key);
      } else {
        nextSelectedKeys.delete(key);
      }
    }

    selectionManager.setSelectedKeys(nextSelectedKeys);
  }

  return (
    <Checkbox
      slot={null}
      aria-label={`Select ${label}`}
      isDisabled={!selectionManager.canSelectItem(id)}
      isSelected={isSelected}
      isIndeterminate={isIndeterminate}
      onChange={handleChange}
      size="sm"
      className="shrink-0"
    />
  );
}
