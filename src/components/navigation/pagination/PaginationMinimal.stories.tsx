import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { PaginationMinimal } from "./Pagination";

const meta = {
  title: "Components/Navigation/PaginationMinimal",
  component: PaginationMinimal,
  parameters: { layout: "centered" },
  args: {
    page: 1,
    total: 10,
    pageSize: 10,
    align: "left",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["left", "center", "right"] },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize);

    return (
      <div className="w-[min(90vw,40rem)]">
        <PaginationMinimal
          {...args}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    );
  },
} satisfies Meta<typeof PaginationMinimal>;

export default meta;
type Story = StoryObj<typeof meta>;

const isDesktop = () => window.innerWidth >= 768;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (name: string) => canvas.getByRole("button", { name });

    // Without a total item count, the page is shown instead of the row range.
    await expect(canvas.getByText("Page 1 of 10")).toBeInTheDocument();
    await expect(canvas.queryByText(/^\d+ - \d+ of/)).not.toBeInTheDocument();

    // The buttons show their text with an arrow pointing their way.
    await expect(button("Previous Page")).toHaveTextContent("Previous");
    await expect(button("Next Page")).toHaveTextContent("Next");
    await expect(
      button("Previous Page").querySelector(".tabler-icon-arrow-left"),
    ).toBeVisible();
    await expect(
      button("Next Page").querySelector(".tabler-icon-arrow-right"),
    ).toBeVisible();

    // There is nowhere to go back to from the first page.
    await expect(button("Previous Page")).toBeDisabled();
    await expect(button("Next Page")).toBeEnabled();

    await userEvent.click(button("Next Page"));
    await expect(await canvas.findByText("Page 2 of 10")).toBeInTheDocument();
    await expect(button("Previous Page")).toBeEnabled();
  },
};

export const LastPage: Story = {
  args: { page: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Next Page" }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Previous Page" }));
    await expect(await canvas.findByText("Page 9 of 10")).toBeInTheDocument();
  },
};

export const ChangesPageSize: Story = {
  play: async ({ canvasElement }) => {
    // The page size is only shown from the medium breakpoint up.
    if (!isDesktop()) return;

    const canvas = within(canvasElement);

    await expect(canvas.getByText("Rows per page")).toBeVisible();

    // A vertical separator divides the page from the page size.
    const separator = canvasElement.querySelector("[role=separator]")!;
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(separator.getBoundingClientRect().width).toBe(1);
    await expect(separator.getBoundingClientRect().height).toBe(16);
    await userEvent.click(canvas.getByRole("button", { name: /Page Size/ }));
    await userEvent.click(await screen.findByRole("option", { name: "25" }));
    await expect(
      canvas.getByRole("button", { name: /Page Size/ }),
    ).toHaveTextContent("25");
  },
};

/** Returns the left edges of the buttons and the page text, in order. */
const getPositions = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  return {
    previous: canvas
      .getByRole("button", { name: "Previous Page" })
      .getBoundingClientRect().left,
    next: canvas
      .getByRole("button", { name: "Next Page" })
      .getBoundingClientRect().left,
    pageOf: canvas.getByText("Page 1 of 10").getBoundingClientRect().left,
  };
};

export const AlignLeft: Story = {
  args: { align: "left" },
  play: async ({ canvasElement }) => {
    if (!isDesktop()) return;

    // The buttons are together on the left, the page on the right.
    const { previous, next, pageOf } = getPositions(canvasElement);
    await expect(previous).toBeLessThan(next);
    await expect(next).toBeLessThan(pageOf);

    // The page size comes before the page.
    await expect(
      within(canvasElement).getByText("Rows per page").getBoundingClientRect()
        .left,
    ).toBeLessThan(pageOf);
  },
};

export const AlignCenter: Story = {
  args: { align: "center" },
  play: async ({ canvasElement }) => {
    if (!isDesktop()) return;

    // The page sits between the buttons.
    const { previous, next, pageOf } = getPositions(canvasElement);
    await expect(previous).toBeLessThan(pageOf);
    await expect(pageOf).toBeLessThan(next);
  },
};

export const AlignRight: Story = {
  args: { align: "right" },
  play: async ({ canvasElement }) => {
    if (!isDesktop()) return;

    // The page is on the left, the buttons are together on the right.
    const { previous, next, pageOf } = getPositions(canvasElement);
    await expect(pageOf).toBeLessThan(previous);
    await expect(previous).toBeLessThan(next);
  },
};

export const CustomLabels: Story = {
  args: {
    labels: {
      previous: "Trước",
      next: "Sau",
      previousPage: "Trang trước",
      nextPage: "Trang sau",
      pageOf: (page, total) => `Trang ${page} / ${total}`,
      rowsPerPage: "Số dòng mỗi trang",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The labels passed in replace their defaults.
    await expect(canvas.getByText("Trang 1 / 10")).toBeInTheDocument();
    await expect(canvas.getByText("Số dòng mỗi trang")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Trang trước" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Trang sau" }),
    ).toBeEnabled();
    await expect(
      canvas.getByRole("button", { name: "Trang trước" }),
    ).toHaveTextContent("Trước");

    // The labels left out keep their defaults.
    if (isDesktop()) {
      await expect(
        canvas.getByRole("button", { name: /Page Size/ }),
      ).toBeInTheDocument();
    }
  },
};

export const ShowsRowRange: Story = {
  args: { totalItems: 95 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The row range replaces the page.
    await expect(canvas.getByText("1 - 10 of 95")).toBeVisible();
    await expect(canvas.queryByText("Page 1 of 10")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Next Page" }));
    await expect(await canvas.findByText("11 - 20 of 95")).toBeInTheDocument();
  },
};

export const PartialLastPage: Story = {
  args: { page: 10, totalItems: 95 },
  play: async ({ canvasElement }) => {
    // The last page is partial, so the range stops at the item count.
    await expect(
      within(canvasElement).getByText("91 - 95 of 95"),
    ).toBeInTheDocument();
  },
};
