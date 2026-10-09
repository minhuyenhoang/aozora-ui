import { useState } from "react";
import type { Grid } from "@1771technologies/lytenyte-core";
import { useClientDataSource } from "@1771technologies/lytenyte-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { DataGrid } from "./DataGrid";
import { DataGridSettings } from "./DataGridSettings";
import { DataGridRowGroupMarkerCell } from "./cell/DataGridRowGroupCell";
import { DataGridRowMasterDetailMarkerCell } from "./cell/DataGridRowMasterDetailMarkerCell";

interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  status: string;
  createdAt: string;
}

const firstNames = ["Olivia", "Phoenix", "Lana", "Demi", "Candice", "Natali"];
const lastNames = ["Rhye", "Baker", "Steiner", "Wilkinson", "Wu", "Craig"];
const statuses = ["Paid", "Pending", "Refunded", "Cancelled"];

const orders: Order[] = Array.from({ length: 60 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index * 5 + 2) % lastNames.length];

  return {
    id: `ORD-${String(1001 + index)}`,
    firstName,
    lastName,
    email: `${firstName}.${lastName}@example.com`.toLowerCase(),
    amount: 120 + ((index * 137) % 900),
    status: statuses[(index * 3) % statuses.length],
    createdAt: `2026-0${(index % 9) + 1}-${String((index % 27) + 1).padStart(2, "0")}`,
  };
});

const groupedColumns: Grid.Column[] = [
  { id: "id", name: "Order", width: 110 },
  { id: "firstName", name: "First name", groupPath: ["Customer"] },
  { id: "lastName", name: "Last name", groupPath: ["Customer"] },
  { id: "email", name: "Email", width: 240, groupPath: ["Customer"] },
  { id: "amount", name: "Amount", type: "number", groupPath: ["Payment"] },
  { id: "status", name: "Status", groupPath: ["Payment"] },
  { id: "createdAt", name: "Created at" },
];

const columns = groupedColumns.map((column) => ({
  ...column,
  groupPath: undefined,
}));

const columnBase: Grid.ColumnBase = {
  resizable: true,
  movable: true,
};

interface StoryArgs {
  isLoading: boolean;
  rowHeight: number;
  /** The column definitions. Set `groupPath`, `pin`, `hide` or `width`. */
  columns: Grid.Column[];
  /** The rows shown in the grid. */
  data: Order[];
}

function Example({
  isLoading,
  rowHeight,
  columns,
  data,
  showSettings = false,
}: StoryArgs & { showSettings?: boolean }) {
  // The grid does not keep its own columns, so the parent stores them.
  const [gridColumns, setGridColumns] = useState(columns);
  const rowSource = useClientDataSource<Order>({ data });

  return (
    <div className="flex w-[min(92vw,60rem)] flex-col gap-3">
      {showSettings && (
        <div className="flex justify-end">
          <DataGridSettings
            columns={gridColumns}
            onColumnsChange={setGridColumns}
          />
        </div>
      )}
      <div className="ln-grid h-112 overflow-hidden rounded-xl ring-1 ring-secondary">
        <DataGrid
          columns={gridColumns}
          onColumnsChange={setGridColumns}
          columnBase={columnBase}
          rowSource={rowSource}
          rowHeight={rowHeight}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Data Grid/DataGrid",
  parameters: { layout: "centered" },
  args: {
    isLoading: false,
    rowHeight: 35,
    columns,
    data: orders,
  },
  argTypes: {
    isLoading: { control: "boolean" },
    rowHeight: { control: { type: "range", min: 28, max: 56, step: 1 } },
    columns: { control: "object" },
    data: { control: "object" },
  },
  // Remount when a control changes, since the columns are seeded once.
  render: (args) => <Example key={JSON.stringify(args)} {...args} />,
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Order")).toBeVisible());
    await expect(canvas.getByText("ORD-1001")).toBeVisible();
    await expect(canvas.queryByText("Empty Data")).toBeNull();
  },
};

export const ColumnGroups: Story = {
  args: { columns: groupedColumns },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Customer")).toBeVisible());
  },
};

export const Loading: Story = {
  args: { isLoading: true, data: [] },
  play: async ({ canvasElement }) => {
    // The empty state is not shown while loading.
    await expect(within(canvasElement).queryByText("Empty Data")).toBeNull();
  },
};

export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).getByText("Empty Data")).toBeVisible(),
    );
  },
};

export const PinnedColumns: Story = {
  args: {
    columns: columns.map((column) =>
      column.id === "id"
        ? { ...column, pin: "start" }
        : column.id === "createdAt"
          ? { ...column, pin: "end" }
          : column,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = (text: string) =>
      canvas.getByText(text).closest<HTMLElement>("[role=columnheader]")!;

    await waitFor(() => expect(canvas.getByText("Order")).toBeVisible());
    await expect(header("Order")).toHaveAttribute("data-ln-colpin", "start");
    await expect(header("Created at")).toHaveAttribute("data-ln-colpin", "end");
    await expect(header("Email")).toHaveAttribute("data-ln-colpin", "center");

    // Both pinned columns stay in view however wide the other columns are.
    const grid = canvas.getByRole("grid").getBoundingClientRect();

    await expect(
      header("Order").getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(grid.left);
    await expect(
      header("Created at").getBoundingClientRect().right,
    ).toBeLessThanOrEqual(grid.right + 1);
  },
};

/** A whole group pinned to the start, with its header above its columns. */
export const PinnedGroup: Story = {
  args: {
    columns: groupedColumns.map((column) =>
      column.groupPath?.[0] === "Payment"
        ? { ...column, pin: "start" }
        : column,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const left = (text: string) =>
      canvas
        .getByText(text)
        .closest("[role=columnheader]")!
        .getBoundingClientRect().left;

    await waitFor(() => expect(canvas.getByText("Payment")).toBeVisible());

    // The pinned group's header starts where its first column starts.
    await expect(left("Payment")).toBe(left("Amount"));
    // The headers after the pinned area are not covered by it.
    await expect(canvas.getByText("Order")).toBeVisible();
    await expect(left("Customer")).toBe(left("First name"));
  },
};

export const TallRows: Story = {
  args: { rowHeight: 48 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("ORD-1001")).toBeVisible());
    await expect(
      canvas
        .getByText("ORD-1001")
        .closest("[role=gridcell]")!
        .getBoundingClientRect().height,
    ).toBe(48);
  },
};

/** The column settings modal driving the same columns as the grid. */
export const WithColumnSettings: Story = {
  args: { columns: groupedColumns },
  render: (args) => (
    <Example key={JSON.stringify(args)} {...args} showSettings />
  ),
  play: async ({ canvasElement }) => {
    const pressed = (name: string) =>
      screen.getByRole("button", { name }).getAttribute("aria-pressed");

    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Column settings" }),
    );

    // Pinning a group pins every column in it.
    await userEvent.click(
      await screen.findByRole("button", { name: "Pin Customer" }),
    );
    await expect(pressed("Pin Customer")).toBe("true");
    await expect(pressed("Pin First name")).toBe("true");
    await expect(pressed("Pin Email")).toBe("true");
    await expect(pressed("Pin Amount")).toBe("false");

    // Unpinning one column means the group is no longer fully pinned.
    await userEvent.click(screen.getByRole("button", { name: "Pin Email" }));
    await expect(pressed("Pin Customer")).toBe("false");
    await expect(pressed("Pin First name")).toBe("true");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  },
};

/** Shared frame for the row examples below. */
function GridFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="ln-grid h-112 w-[min(92vw,60rem)] overflow-hidden rounded-xl ring-1 ring-secondary">
      {children}
    </div>
  );
}

const rowGroupColumn: Grid.RowGroupColumn = {
  name: "Status",
  width: 160,
  cellRenderer: DataGridRowGroupMarkerCell,
};

function RowGroupsExample({ isLoading, rowHeight, columns, data }: StoryArgs) {
  const [gridColumns, setGridColumns] = useState(columns);
  const rowSource = useClientDataSource<Order>({
    data,
    // Rows with the same status are gathered under one group row.
    group: [{ id: "status" }],
    rowGroupDefaultExpansion: true,
  });

  return (
    <GridFrame>
      <DataGrid
        columns={gridColumns}
        onColumnsChange={setGridColumns}
        columnBase={columnBase}
        rowSource={rowSource}
        rowGroupColumn={rowGroupColumn}
        rowHeight={rowHeight}
        isLoading={isLoading}
      />
    </GridFrame>
  );
}

/** Rows grouped by status. Each group row can be collapsed. */
export const RowGroups: Story = {
  args: {
    // The grouped value has its own column, so the plain one is hidden.
    columns: columns.map((column) =>
      column.id === "status" ? { ...column, hide: true } : column,
    ),
  },
  render: (args) => <RowGroupsExample key={JSON.stringify(args)} {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole("button", { name: "Toggle Paid" });

    await expect(canvas.getByText("ORD-1001")).toBeVisible();

    // Collapsing the group hides its rows.
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.queryByText("ORD-1001")).toBeNull());
    await expect(
      canvas.getByRole("button", { name: "Toggle Paid" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

function RowPinningExample({ isLoading, rowHeight, columns, data }: StoryArgs) {
  const [gridColumns, setGridColumns] = useState(columns);

  const rowSource = useClientDataSource<Order>({
    // Pinned rows are passed apart from the rows that scroll.
    topData: data.slice(0, 2),
    data: data.slice(2, data.length - 2),
    bottomData: data.slice(-2),
  });

  return (
    <GridFrame>
      <DataGrid
        columns={gridColumns}
        onColumnsChange={setGridColumns}
        columnBase={columnBase}
        rowSource={rowSource}
        rowHeight={rowHeight}
        isLoading={isLoading}
      />
    </GridFrame>
  );
}

/** Two rows pinned to the top and two pinned to the bottom. */
export const RowPinning: Story = {
  render: (args) => <RowPinningExample key={JSON.stringify(args)} {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The last two orders are pinned to the bottom, so they show at once.
    await waitFor(() => expect(canvas.getByText("ORD-1060")).toBeVisible());
    await expect(canvas.getByText("ORD-1003")).toBeVisible();

    const scroller = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(".ln-grid *"),
    ).find((element) => element.scrollHeight > element.clientHeight + 50)!;

    scroller.scrollTop = 600;

    // The rows that scroll have moved on. The pinned ones have not.
    await waitFor(() => expect(canvas.queryByText("ORD-1003")).toBeNull());
    await expect(canvas.getByText("ORD-1001")).toBeVisible();
    await expect(canvas.getByText("ORD-1002")).toBeVisible();
    await expect(canvas.getByText("ORD-1059")).toBeVisible();
    await expect(canvas.getByText("ORD-1060")).toBeVisible();
  },
};

/** The detail shown under an expanded row. */
function OrderDetail({ row }: Grid.T.RowParams) {
  const order = row.data as Order;

  return (
    <dl className="grid h-full grid-cols-[auto_1fr] content-center gap-x-4 gap-y-1 bg-secondary px-12 text-sm">
      <dt className="text-tertiary">Customer</dt>
      <dd className="text-primary">
        {order.firstName} {order.lastName}
      </dd>
      <dt className="text-tertiary">Email</dt>
      <dd className="text-primary">{order.email}</dd>
      <dt className="text-tertiary">Placed on</dt>
      <dd className="text-primary">{order.createdAt}</dd>
    </dl>
  );
}

/** The leading column with the button that opens a row's detail. */
const detailMarker: Grid.ColumnMarker = {
  on: true,
  width: 40,
  cellRenderer: DataGridRowMasterDetailMarkerCell,
};

function MasterDetailExample({
  isLoading,
  rowHeight,
  columns,
  data,
}: StoryArgs) {
  const [gridColumns, setGridColumns] = useState(columns);
  // The ids of the rows whose detail is open.
  const [expansions, setExpansions] = useState(() => new Set<string>());
  const rowSource = useClientDataSource<Order>({
    data,
    // Rows are identified by their order id, not by their position.
    leafIdFn: (order) => order.id,
  });

  return (
    <GridFrame>
      <DataGrid
        columns={gridColumns}
        onColumnsChange={setGridColumns}
        columnBase={columnBase}
        columnMarker={detailMarker}
        rowSource={rowSource}
        rowDetailRenderer={OrderDetail}
        rowDetailHeight={96}
        rowDetailExpansions={expansions}
        onRowDetailExpansionsChange={setExpansions}
        rowHeight={rowHeight}
        isLoading={isLoading}
      />
    </GridFrame>
  );
}

/** Each row can be expanded to show more about it underneath. */
export const MasterDetail: Story = {
  render: (args) => (
    <MasterDetailExample key={JSON.stringify(args)} {...args} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole("button", {
      name: "Toggle details of ORD-1001",
    });

    await expect(canvas.queryByText("Placed on")).toBeNull();

    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText("Placed on")).toBeVisible());

    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle details of ORD-1001" }),
    );
    await waitFor(() => expect(canvas.queryByText("Placed on")).toBeNull());
  },
};
