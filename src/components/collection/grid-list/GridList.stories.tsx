import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconFile, IconInbox } from "@tabler/icons-react";
import type { Selection } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GridList } from "./GridList";
import { GridListEmptyState } from "./GridListEmptyState";
import { GridListItem } from "./GridListItem";
import { GridListSection } from "./GridListSection";

interface Task {
  id: string;
  label: string;
}

const todoTasks: Task[] = [
  { id: "research", label: "Research" },
  { id: "wireframes", label: "Wireframes" },
  { id: "prototype", label: "Prototype" },
];

const doneTasks: Task[] = [
  { id: "kickoff", label: "Kickoff" },
  { id: "brief", label: "Brief" },
];

const renderTask = (task: Task) => <GridListItem label={task.label} />;

/** The labels of the item rows, leaving out headers and the empty state. */
function rowNames(list: HTMLElement) {
  return Array.from(list.querySelectorAll("[role=row][data-key]")).map(
    (row) => row.textContent,
  );
}

/**
 * Drags a row and drops it near the bottom edge of the target. The drag events
 * are native ones, so that they all share one `DataTransfer`.
 */
async function dragAndDrop(source: HTMLElement, target: HTMLElement) {
  const dataTransfer = new DataTransfer();

  // Outside a real drag the browser reports that no operation is allowed.
  Object.defineProperty(dataTransfer, "effectAllowed", {
    value: "all",
    writable: true,
  });
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
    // The list reacts to each step after a render.
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  await send("dragstart", source);
  await send("dragenter", target);
  await send("dragover", target);
  await send("drop", target);
  await send("dragend", source);
}

const meta = {
  title: "Components/Collection/GridList",
  component: GridList,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Tasks",
    showCheckboxes: true,
    size: "sm",
    selectionMode: "multiple",
    defaultSelectedKeys: ["wireframes"],
    children: null,
  },
  argTypes: {
    showCheckboxes: { control: "boolean" },
    allowsReordering: { control: "boolean" },
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
    <GridList {...args}>
      <GridListItem
        id="research"
        label="Research"
        description="Interview five customers"
        icon={<IconFile />}
      />
      <GridListItem id="wireframes" label="Wireframes" icon={<IconFile />} />
      <GridListItem
        id="prototype"
        label="Prototype"
        icon={<IconFile />}
        trailingContent="Fri"
      />
      <GridListItem id="handoff" label="Handoff" isDisabled />
    </GridList>
  ),
} satisfies Meta<typeof GridList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Static rows with uncontrolled selection. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = (name: RegExp) => canvas.getByRole("row", { name });
    const checkbox = (name: string) =>
      canvas.getByRole("checkbox", { name: `Select ${name}` });

    await expect(canvas.getByRole("grid", { name: "Tasks" })).toBeVisible();
    await expect(checkbox("Wireframes")).toBeChecked();
    await expect(row(/Wireframes/)).toHaveAttribute("aria-selected", "true");

    // The checkbox and the row both toggle the selection.
    await userEvent.click(checkbox("Research"));
    await expect(checkbox("Research")).toBeChecked();
    await userEvent.click(row(/Wireframes/));
    await expect(checkbox("Wireframes")).not.toBeChecked();

    await expect(checkbox("Handoff")).toBeDisabled();
    // Static rows can't be dragged.
    await expect(canvas.queryByRole("button", { name: /^Drag/ })).toBeNull();
  },
};

function ControlledSelectionList() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(["research"]),
  );

  return (
    <div className="flex flex-col gap-3">
      <GridList
        aria-label="Tasks"
        items={todoTasks}
        showCheckboxes
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {renderTask}
      </GridList>
      <p className="text-sm text-tertiary" data-testid="selection">
        {selectedKeys === "all" ? "all" : [...selectedKeys].join(", ")}
      </p>
    </div>
  );
}

export const ControlledSelection: Story = {
  render: ControlledSelectionList,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId("selection")).toHaveTextContent("research");
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select Prototype" }),
    );
    await expect(canvas.getByTestId("selection")).toHaveTextContent(
      "research, prototype",
    );
  },
};

/** Checkboxes are opt-in, and a single row can opt out. */
export const WithoutCheckboxes: Story = {
  args: { showCheckboxes: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("checkbox")).toBeNull();
    // Rows stay selectable without a checkbox.
    await userEvent.click(canvas.getByRole("row", { name: /Research/ }));
    await expect(canvas.getByRole("row", { name: /Research/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const Sections: Story = {
  args: { size: "md" },
  render: (args) => (
    <GridList {...args}>
      <GridListSection title="To do">
        <GridListItem id="research" label="Research" />
        <GridListItem id="wireframes" label="Wireframes" />
      </GridListSection>
      <GridListSection title="Done">
        <GridListItem id="kickoff" label="Kickoff" />
      </GridListSection>
    </GridList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("rowgroup", { name: "To do" })).toBeVisible();
    await expect(
      within(canvas.getByRole("rowgroup", { name: "Done" })).getByRole("row", {
        name: "Kickoff",
      }),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => (
    <GridList<Task>
      aria-label="Tasks"
      items={[]}
      renderEmptyState={() => (
        <GridListEmptyState
          icon={<IconInbox />}
          title="No tasks"
          description="New tasks will show up here."
        />
      )}
    >
      {renderTask}
    </GridList>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No tasks")).toBeVisible();
  },
};

/** An uncontrolled list that reorders its own items. */
export const Reorderable: Story = {
  render: () => (
    <GridList<Task>
      aria-label="Tasks"
      defaultItems={todoTasks}
      allowsReordering
    >
      {renderTask}
    </GridList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("grid", { name: "Tasks" });
    const row = (name: string) => canvas.getByRole("row", { name });

    await expect(rowNames(list)).toEqual([
      "Research",
      "Wireframes",
      "Prototype",
    ]);
    // Every row has a handle for dragging it with the keyboard.
    await expect(
      canvas.getByRole("button", { name: "Drag Research" }),
    ).toBeInTheDocument();

    await dragAndDrop(row("Research"), row("Prototype"));
    await waitFor(() =>
      expect(rowNames(list)).toEqual(["Wireframes", "Prototype", "Research"]),
    );
  },
};

function ControlledBoard() {
  const [todo, setTodo] = useState(todoTasks);
  const [done, setDone] = useState(doneTasks);

  return (
    <div className="grid grid-cols-2 gap-4">
      <GridList<Task>
        aria-label="To do"
        items={todo}
        onItemsChange={setTodo}
        allowsReordering
        dragGroup="tasks"
        showCheckboxes
        className="rounded-lg p-1 ring-1 ring-secondary"
      >
        {renderTask}
      </GridList>
      <GridList<Task>
        aria-label="Done"
        items={done}
        onItemsChange={setDone}
        allowsReordering
        dragGroup="tasks"
        showCheckboxes
        className="rounded-lg p-1 ring-1 ring-secondary"
      >
        {renderTask}
      </GridList>
    </div>
  );
}

/** Two controlled lists in one group exchange and reorder their items. */
export const BetweenLists: Story = {
  decorators: [
    (Story) => (
      <div className="w-[36rem]">
        <Story />
      </div>
    ),
  ],
  render: ControlledBoard,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const todo = canvas.getByRole("grid", { name: "To do" });
    const done = canvas.getByRole("grid", { name: "Done" });
    const row = (name: string) => canvas.getByRole("row", { name });

    await dragAndDrop(row("Research"), row("Kickoff"));
    await waitFor(() =>
      expect(rowNames(done)).toEqual(["Kickoff", "Research", "Brief"]),
    );
    await expect(rowNames(todo)).toEqual(["Wireframes", "Prototype"]);

    // Moved items can be reordered inside their new list.
    await dragAndDrop(row("Research"), row("Brief"));
    await waitFor(() =>
      expect(rowNames(done)).toEqual(["Kickoff", "Brief", "Research"]),
    );

    // An emptied list still accepts drops.
    await dragAndDrop(row("Wireframes"), row("Brief"));
    await dragAndDrop(row("Prototype"), row("Brief"));
    await waitFor(() => expect(rowNames(todo)).toEqual([]));
    await expect(within(todo).getByText("No items")).toBeVisible();

    await dragAndDrop(row("Kickoff"), todo);
    await waitFor(() => expect(rowNames(todo)).toEqual(["Kickoff"]));
  },
};

/** Lists in different groups, or without one, don't exchange items. */
export const DragAndDropDisabled: Story = {
  decorators: [
    (Story) => (
      <div className="w-[36rem]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <GridList<Task> aria-label="To do" defaultItems={todoTasks}>
        {renderTask}
      </GridList>
      <GridList<Task>
        aria-label="Done"
        defaultItems={doneTasks}
        allowsReordering
      >
        {(task) => (
          <GridListItem
            label={task.label}
            showDragHandle={task.id !== "brief"}
          />
        )}
      </GridList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const todo = canvas.getByRole("grid", { name: "To do" });
    const done = canvas.getByRole("grid", { name: "Done" });
    const row = (name: string) => canvas.getByRole("row", { name });

    // Neither option is set, so the first list has no drag handles.
    await expect(within(todo).queryByRole("button", { name: /^Drag/ })).toBeNull();
    await expect(
      within(done).getByRole("button", { name: "Drag Kickoff" }),
    ).toBeInTheDocument();
    await expect(
      within(done).queryByRole("button", { name: "Drag Brief" }),
    ).toBeNull();

    // A reorder-only list keeps its items to itself.
    await dragAndDrop(row("Kickoff"), row("Research"));
    await expect(rowNames(todo)).toEqual([
      "Research",
      "Wireframes",
      "Prototype",
    ]);
    await expect(rowNames(done)).toEqual(["Kickoff", "Brief"]);
  },
};
