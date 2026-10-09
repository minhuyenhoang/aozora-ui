import { useMemo, useState, type ReactNode } from "react";
import type { Grid } from "@1771technologies/lytenyte-core";
import { IconPin, IconPinFilled, IconSettings } from "@tabler/icons-react";
import type { DropTarget, Key, Selection } from "react-aria-components";
import {
  Collection,
  ToggleButton as AriaToggleButton,
  useDragAndDrop,
} from "react-aria-components";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { cx } from "@styles/utils";
import { Button } from "../button/Button";
import { Tree } from "../collection/tree/Tree";
import { TreeDropIndicator } from "../collection/tree/TreeDropIndicator";
import { TreeItem } from "../collection/tree/TreeItem";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTrigger,
} from "../overlay/Modal";
import { type DataGridColumnSetting, getDataGridColumnSettings } from "./utils";

const DRAG_TYPE = "application/x-data-grid-column";

export interface DataGridSettingsLabels {
  trigger: string;
  title: string;
  description: string;
  cancel: string;
  save: string;
  /** Accessible name of the pin toggle. Receives the column or group label. */
  pin: (columnLabel: string) => string;
}

const DEFAULT_LABELS: DataGridSettingsLabels = {
  trigger: "Column settings",
  title: "Column settings",
  description:
    "Choose which columns are shown or pinned, and drag to reorder them.",
  cancel: "Cancel",
  save: "Save",
  pin: (columnLabel) => `Pin ${columnLabel}`,
};

export interface DataGridSettingsProps {
  /** The current columns of the grid. */
  columns: readonly Grid.Column[];
  /** Called with the updated columns when the settings are saved. */
  onColumnsChange: (columns: Grid.Column[]) => void;
  /**
   * The localStorage key to save the column order, visibility and group
   * structure under. Nothing is persisted when omitted.
   */
  storageKey?: string;
  /** Returns the text shown for a column. Defaults to its name, then its id. */
  getColumnLabel?: (column: Grid.Column) => string;
  /** Overrides the text used in the modal. */
  labels?: Partial<DataGridSettingsLabels>;
  /** A custom trigger element. Defaults to a settings icon button. */
  children?: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

interface GroupNode {
  id: string;
  kind: "group";
  name: string;
  children: SettingsNode[];
}

interface ColumnNode {
  id: string;
  kind: "column";
  column: Grid.Column;
}

type SettingsNode = GroupNode | ColumnNode;

const getColumnKey = (id: string) => `column:${id}`;
const getGroupKey = (path: string[]) => `group:${path.join("\u001f")}`;

/** Turns the flat column list into a tree, using each column's `groupPath`. */
function buildTree(columns: readonly Grid.Column[]): SettingsNode[] {
  const roots: SettingsNode[] = [];
  const groups = new Map<string, GroupNode>();

  for (const column of columns) {
    const path = column.groupPath ?? [];
    let siblings = roots;

    for (let depth = 1; depth <= path.length; depth++) {
      const id = getGroupKey(path.slice(0, depth));
      let group = groups.get(id);

      if (!group) {
        group = { id, kind: "group", name: path[depth - 1], children: [] };
        groups.set(id, group);
        siblings.push(group);
      }

      siblings = group.children;
    }

    siblings.push({ id: getColumnKey(column.id), kind: "column", column });
  }

  return roots;
}

/** Turns the tree back into a flat, ordered column list. */
function flattenTree(
  nodes: SettingsNode[],
  visibleKeys: Set<Key>,
  path: string[] = [],
): Grid.Column[] {
  return nodes.flatMap((node) =>
    node.kind === "group"
      ? flattenTree(node.children, visibleKeys, [...path, node.name])
      : [
          {
            ...node.column,
            hide: !visibleKeys.has(node.id),
            groupPath: path.length ? path : undefined,
          },
        ],
  );
}

/** Lists the keys of every group, or every column, in the tree. */
function collectKeys(
  nodes: SettingsNode[],
  kind: SettingsNode["kind"],
): string[] {
  return nodes.flatMap((node) => [
    ...(node.kind === kind ? [node.id] : []),
    ...(node.kind === "group" ? collectKeys(node.children, kind) : []),
  ]);
}

/** Lists the columns in a node: itself, or every column under a group. */
function getColumns(node: SettingsNode): Grid.Column[] {
  return node.kind === "column"
    ? [node.column]
    : node.children.flatMap(getColumns);
}

/** Returns a copy of a node with the pin set on every column in it. */
function pinNode(node: SettingsNode, pin: Grid.Column["pin"]): SettingsNode {
  return node.kind === "column"
    ? { ...node, column: { ...node.column, pin } }
    : { ...node, children: node.children.map((child) => pinNode(child, pin)) };
}

/**
 * Returns a copy of the tree with the pin changed on one row. For a group
 * row, that means every column under it.
 */
function setPin(
  nodes: SettingsNode[],
  key: string,
  pin: Grid.Column["pin"],
): SettingsNode[] {
  return nodes.map((node) => {
    if (node.id === key) return pinNode(node, pin);

    return node.kind === "group"
      ? { ...node, children: setPin(node.children, key, pin) }
      : node;
  });
}

/** Moves the given nodes next to the target, and drops groups left empty. */
function moveNodes(
  nodes: SettingsNode[],
  keys: Set<Key>,
  targetKey: Key,
  position: "before" | "after",
): SettingsNode[] {
  if (keys.has(targetKey)) return nodes;

  const moved: SettingsNode[] = [];
  let didInsert = false;

  /** Takes the moved nodes out of the tree. */
  function remove(list: SettingsNode[]): SettingsNode[] {
    const kept: SettingsNode[] = [];

    for (const node of list) {
      if (keys.has(node.id)) moved.push(node);
      else if (node.kind === "column") kept.push(node);
      else kept.push({ ...node, children: remove(node.children) });
    }

    return kept;
  }

  /** Puts the moved nodes next to the target and skips empty groups. */
  function insert(list: SettingsNode[]): SettingsNode[] {
    return list.flatMap((node) => {
      const next =
        node.kind === "group"
          ? { ...node, children: insert(node.children) }
          : node;
      const kept = next.kind === "group" && !next.children.length ? [] : [next];

      if (node.id !== targetKey) return kept;

      didInsert = true;
      return position === "before" ? [...moved, ...kept] : [...kept, ...moved];
    });
  }

  const result = insert(remove(nodes));

  // The target was inside a moved group, so there is nowhere to drop.
  return didInsert ? result : nodes;
}

/** Draws the line that shows where a dragged row will land. */
function renderDropIndicator(target: DropTarget) {
  return <TreeDropIndicator target={target} />;
}

interface SettingsProps extends Pick<
  DataGridSettingsProps,
  "columns" | "onColumnsChange" | "storageKey"
> {
  getColumnLabel: (column: Grid.Column) => string;
  labels: DataGridSettingsLabels;
  close: () => void;
}

/** The modal content. Holds unsaved edits, and is mounted only while open. */
function Settings({
  columns,
  onColumnsChange,
  storageKey,
  getColumnLabel,
  labels,
  close,
}: SettingsProps) {
  const [nodes, setNodes] = useState(() => buildTree(columns));
  const [visibleKeys, setVisibleKeys] = useState<Set<Key>>(
    () =>
      new Set(
        columns
          .filter((column) => !column.hide)
          .map((column) => getColumnKey(column.id)),
      ),
  );
  const [defaultExpandedKeys] = useState(() => collectKeys(nodes, "group"));
  // Without a storage key, this keeps nothing beyond the open modal.
  const [, setStoredSettings] = useLocalStorage<DataGridColumnSetting[] | null>(
    storageKey,
    null,
  );

  const { dragAndDropHooks } = useDragAndDrop<SettingsNode>({
    getItems: (keys) =>
      Array.from(keys, (key) => ({ [DRAG_TYPE]: String(key) })),
    acceptedDragTypes: [DRAG_TYPE],
    // Dropping onto a row would nest it and create a new group.
    getDropOperation: (target) =>
      target.type === "item" && target.dropPosition !== "on"
        ? "move"
        : "cancel",
    onMove({ keys, target }) {
      if (target.dropPosition === "on") return;

      const { key, dropPosition } = target;

      setNodes((current) => moveNodes(current, keys, key, dropPosition));
    },
    renderDropIndicator,
  });

  // Checked rows are the tree's selection, and dragging a selected row would
  // drag every selected row. Hiding the selection from the drag logic makes
  // a drag move only the row that was picked up.
  const singleRowDragHooks = useMemo(() => {
    const useDragState = dragAndDropHooks.useDraggableCollectionState;

    if (!useDragState) return dragAndDropHooks;

    return {
      ...dragAndDropHooks,
      useDraggableCollectionState: ((props) =>
        useDragState({
          ...props,
          selectionManager: Object.create(props.selectionManager, {
            isSelected: { value: () => false },
          }),
        })) satisfies typeof useDragState,
    };
  }, [dragAndDropHooks]);

  /** Applies the edits, saves them when a storage key is set, and closes. */
  function handleSave() {
    const nextColumns = flattenTree(nodes, visibleKeys);

    onColumnsChange(nextColumns);
    setStoredSettings(getDataGridColumnSettings(nextColumns));
    close();
  }

  /**
   * The pin button shown at the end of a row. On a group row it pins or
   * unpins every column in the group, and shows as pinned when all are.
   */
  function renderPinToggle(node: SettingsNode, rowLabel: string) {
    const isPinned = getColumns(node).every((column) => column.pin != null);
    const PinIcon = isPinned ? IconPinFilled : IconPin;

    return (
      <AriaToggleButton
        // Opts out of the button slots the tree row provides.
        slot={null}
        aria-label={labels.pin(rowLabel)}
        isSelected={isPinned}
        // Pins to the start side. Unpinning clears either side.
        onChange={(nextIsPinned) =>
          setNodes((current) =>
            setPin(current, node.id, nextIsPinned ? "start" : null),
          )
        }
        className={({ isSelected, isHovered, isFocusVisible }) =>
          cx(
            "flex size-5 cursor-pointer items-center justify-center rounded text-fg-quaternary outline-hidden",
            isHovered && "text-fg-quaternary_hover",
            isSelected && "text-fg-brand-primary",
            isFocusVisible && "ring-2 ring-focus-ring",
          )
        }
      >
        <PinIcon aria-hidden="true" className="size-4" />
      </AriaToggleButton>
    );
  }

  /** Renders a group row with its children, or a column row. */
  function renderNode(node: SettingsNode): ReactNode {
    if (node.kind === "group") {
      return (
        <TreeItem
          id={node.id}
          label={node.name}
          trailingContent={renderPinToggle(node, node.name)}
        >
          <Collection items={node.children}>{renderNode}</Collection>
        </TreeItem>
      );
    }

    const columnLabel = getColumnLabel(node.column);

    return (
      <TreeItem
        id={node.id}
        label={columnLabel}
        trailingContent={renderPinToggle(node, columnLabel)}
      />
    );
  }

  return (
    <>
      <ModalClose />
      <ModalHeader title={labels.title} description={labels.description} />
      <ModalBody>
        <Tree<SettingsNode>
          aria-label={labels.title}
          items={nodes}
          defaultExpandedKeys={defaultExpandedKeys}
          selectionMode="multiple"
          selectedKeys={visibleKeys}
          onSelectionChange={(selection: Selection) =>
            setVisibleKeys(
              new Set(
                selection === "all" ? collectKeys(nodes, "column") : selection,
              ),
            )
          }
          showCheckboxes
          showLines
          dragAndDropHooks={singleRowDragHooks}
        >
          {renderNode}
        </Tree>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" size="md" onPress={close}>
          {labels.cancel}
        </Button>
        <Button color="primary" size="md" onPress={handleSave}>
          {labels.save}
        </Button>
      </ModalFooter>
    </>
  );
}

/** The default row text: the column name, or its id when it has none. */
const defaultGetColumnLabel = (column: Grid.Column) => column.name ?? column.id;

/**
 * A modal for showing, hiding, pinning and reordering data grid columns.
 * Edits apply on save, and are also stored when `storageKey` is set.
 */
export function DataGridSettings({
  columns,
  onColumnsChange,
  storageKey,
  getColumnLabel = defaultGetColumnLabel,
  labels,
  children,
  ...triggerProps
}: DataGridSettingsProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <ModalTrigger {...triggerProps}>
      {children ?? (
        <Button
          color="secondary"
          iconLeading={IconSettings}
          aria-label={resolvedLabels.trigger}
        />
      )}
      <ModalOverlay isDismissable>
        <Modal className="sm:max-w-100">
          <ModalDialog>
            {({ close }) => (
              <Settings
                columns={columns}
                onColumnsChange={onColumnsChange}
                storageKey={storageKey}
                getColumnLabel={getColumnLabel}
                labels={resolvedLabels}
                close={close}
              />
            )}
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </ModalTrigger>
  );
}
