import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconBuilding,
  IconLock,
  IconLockOpen,
  IconUser,
} from "@tabler/icons-react";
import type { Key } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Collection } from "react-aria-components";
import { useTreeData } from "react-stately";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";

const meta = {
  title: "Components/Collection/Tree",
  component: Tree,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Organization",
    showCheckboxes: true,
    showLines: true,
    size: "sm",
    selectionMode: "multiple",
    defaultExpandedKeys: ["organization", "design"],
    defaultSelectedKeys: ["sienna", "ammar", "caitlyn"],
    children: null,
  },
  argTypes: {
    showCheckboxes: { control: "boolean" },
    showLines: { control: "boolean" },
    size: { control: "select", options: ["sm", "md"] },
    selectionMode: {
      control: "select",
      options: ["none", "single", "multiple"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Tree {...args}>
      <TreeItem id="organization" label="Organization">
        <TreeItem id="engineering" label="Engineering" />
        <TreeItem id="design" label="Design">
          <TreeItem id="sienna" label="Sienna Hewitt" />
          <TreeItem id="ammar" label="Ammar Foley" />
          <TreeItem id="caitlyn" label="Caitlyn King" />
        </TreeItem>
        <TreeItem id="product" label="Product" />
        <TreeItem id="marketing" label="Marketing" />
        <TreeItem id="sales" label="Sales" />
        <TreeItem id="customer-success" label="Customer Success" />
        <TreeItem id="operations" label="Operations" />
        <TreeItem id="finance" label="Finance" />
      </TreeItem>
    </Tree>
  ),
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = (name: RegExp) => canvas.getByRole("row", { name });
    const checkbox = (name: string) =>
      canvas.getByRole("checkbox", { name: `Select ${name}` });

    await expect(
      canvas.getByRole("treegrid", { name: "Organization" }),
    ).toBeVisible();
    await expect(row(/^Design/)).toHaveAttribute("aria-expanded", "true");
    await expect(row(/^Engineering/)).toHaveAttribute("aria-level", "2");
    await expect(row(/^Sienna Hewitt/)).toHaveAttribute("aria-level", "3");

    // Every member of Design is selected, so Design is checked. Only part of
    // the organization is, so its checkbox is in the mixed state.
    await expect(checkbox("Design")).toBeChecked();
    await expect(checkbox("Organization")).toBePartiallyChecked();

    // Clearing one member leaves Design partly selected.
    await userEvent.click(checkbox("Ammar Foley"));
    await expect(checkbox("Design")).toBePartiallyChecked();

    // Checking a branch selects everything under it.
    await userEvent.click(checkbox("Organization"));
    await expect(checkbox("Organization")).toBeChecked();
    await expect(checkbox("Ammar Foley")).toBeChecked();
    await expect(checkbox("Finance")).toBeChecked();

    // The left arrow collapses the focused branch and hides its rows.
    row(/^Design/).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(row(/^Design/)).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("row", { name: /^Sienna Hewitt/ })).toBeNull();
  },
};

/** The two accepted forms of `icon`: an element and a function. */
export const WithIcons: Story = {
  args: { showCheckboxes: false, selectionMode: "none" },
  render: (args) => (
    <Tree {...args} defaultExpandedKeys={["organization"]}>
      <TreeItem id="organization" label="Organization" icon={<IconBuilding />}>
        <TreeItem
          id="design"
          label="Design"
          icon={({ isExpanded }) =>
            isExpanded ? <IconLockOpen /> : <IconLock />
          }
        >
          <TreeItem id="sienna" label="Sienna Hewitt" icon={<IconUser />} />
        </TreeItem>
        <TreeItem id="product" label="Product" />
      </TreeItem>
    </Tree>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole("row", { name: /Design/ });

    await expect(row.querySelector(".tabler-icon-lock")).not.toBeNull();
    row.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(row.querySelector(".tabler-icon-lock-open")).not.toBeNull();
    await expect(
      within(canvasElement)
        .getByRole("row", { name: /Organization/ })
        .querySelector(".tabler-icon-building"),
    ).not.toBeNull();
  },
};

interface DndItem {
  id: string;
  label: string;
  children?: DndItem[];
}

interface DndNode {
  key: Key;
  value: DndItem;
  children: DndNode[] | null;
}

const dndItems: DndItem[] = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "research", label: "Research" },
      { id: "prototypes", label: "Prototypes" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    children: [
      { id: "frontend", label: "Frontend" },
      { id: "backend", label: "Backend" },
    ],
  },
];

function DndTree() {
  const tree = useTreeData<DndItem>({
    initialItems: dndItems,
    getKey: (item) => item.id,
    getChildren: (item) => item.children ?? [],
  });

  function renderItem(item: DndNode): ReactNode {
    return (
      <TreeItem id={item.key} label={item.value.label}>
        {item.children && (
          <Collection items={item.children}>{renderItem}</Collection>
        )}
      </TreeItem>
    );
  }

  return (
    <Tree<DndNode>
      aria-label="Draggable organization"
      items={tree.items}
      defaultExpandedKeys={["design", "engineering"]}
      selectionMode="multiple"
      showCheckboxes
      showLines
      dragAndDropOptions={{
        getItems(_keys, items) {
          return items.map((item) => ({
            "text/plain": item.value.label,
          }));
        },
        onMove(event) {
          if (event.target.dropPosition === "before") {
            tree.moveBefore(event.target.key, event.keys);
          } else if (event.target.dropPosition === "after") {
            tree.moveAfter(event.target.key, event.keys);
          } else {
            const target = tree.getItem(event.target.key);
            const targetIndex = target?.children?.length ?? 0;

            for (const [index, key] of Array.from(event.keys).entries()) {
              tree.move(key, event.target.key, targetIndex + index);
            }
          }
        },
      }}
    >
      {renderItem}
    </Tree>
  );
}

export const DragAndDrop: Story = {
  args: {
    children: null,
    showCheckboxes: false,
    showLines: false,
    selectionMode: "none",
  },
  render: DndTree,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = (name: string) => canvas.getByRole("row", { name });
    const rows = () =>
      canvas
        .getAllByRole("row")
        .map((item) => `${item.getAttribute("aria-level")} ${item.textContent}`);

    await expect(rows()).toEqual([
      "1 Design",
      "2 Research",
      "2 Prototypes",
      "1 Engineering",
      "2 Frontend",
      "2 Backend",
    ]);
    // Every row has a handle for dragging it with the keyboard.
    await expect(
      canvas.getByRole("button", { name: "Drag Research" }),
    ).toBeInTheDocument();

    // Drags a row and drops it just under the bottom edge of another. The
    // drag events are native ones, so that they all share one `DataTransfer`.
    const dataTransfer = new DataTransfer();

    // Outside a real drag the browser reports that no operation is allowed.
    Object.defineProperty(dataTransfer, "effectAllowed", {
      value: "all",
      writable: true,
    });
    const source = row("Research");
    const target = row("Backend");
    const box = target.getBoundingClientRect();
    const send = async (type: string, element: HTMLElement) => {
      element.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer,
          clientX: box.left + box.width / 2,
          clientY: box.bottom - 2,
        }),
      );
      // The tree reacts to each step after a render.
      await new Promise((resolve) => setTimeout(resolve, 50));
    };

    await send("dragstart", source);
    await send("dragenter", target);
    await send("dragover", target);
    await send("drop", target);
    await send("dragend", source);

    // Research has moved out of Design, to the end of Engineering.
    await waitFor(() =>
      expect(rows()).toEqual([
        "1 Design",
        "2 Prototypes",
        "1 Engineering",
        "2 Frontend",
        "2 Backend",
        "2 Research",
      ]),
    );
  },
};
