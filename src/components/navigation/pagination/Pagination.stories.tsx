import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { PaginationAdvanced } from "./Pagination";

const meta = {
  title: "Components/Navigation/Pagination",
  component: PaginationAdvanced,
  parameters: { layout: "centered" },
  args: {
    page: 1,
    total: 250,
    pageSize: 10,
    totalItems: 2495,
    align: "space-between",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["space-between", "center"] },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize);

    return (
      <div className="w-[min(90vw,40rem)]">
        <PaginationAdvanced
          {...args}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    );
  },
} satisfies Meta<typeof PaginationAdvanced>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (name: string) => canvas.getByRole("button", { name });

    await expect(
      canvas.getByRole("combobox", { name: "Page" }),
    ).toHaveValue("1");

    // There is nowhere to go back to from the first page.
    await expect(button("First Page")).toBeDisabled();
    await expect(button("Previous Page")).toBeDisabled();
    await expect(button("Next Page")).toBeEnabled();
    await expect(button("Last Page")).toBeEnabled();

    // A vertical separator divides the page size from the row range. Both
    // are only shown from the medium breakpoint up.
    const separator = canvasElement.querySelector("[role=separator]")!;

    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    if (window.innerWidth >= 768) {
      await expect(separator.getBoundingClientRect().width).toBe(1);
      await expect(separator.getBoundingClientRect().height).toBe(16);
    } else {
      await expect(separator).not.toBeVisible();
    }

    // On the last page the forward buttons are the ones turned off.
    await userEvent.click(button("Last Page"));
    await waitFor(() =>
      expect(canvas.getByRole("combobox", { name: "Page" })).toHaveValue("250"),
    );
    await expect(button("Next Page")).toBeDisabled();
    await expect(button("First Page")).toBeEnabled();
  },
};

const getInput = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole("combobox", { name: "Page" });

export const JumpsToTypedPage: Story = {
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    await userEvent.clear(input);
    await userEvent.type(input, "137{Enter}");
    await waitFor(() => expect(input).toHaveValue("137"));

    // The buttons follow the page that was jumped to.
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Next Page" }),
    );
    await waitFor(() => expect(input).toHaveValue("138"));
  },
};

export const SelectsPageFromList: Story = {
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    await userEvent.clear(input);
    await userEvent.type(input, "24");
    await userEvent.click(await screen.findByRole("option", { name: "240" }));
    await waitFor(() => expect(input).toHaveValue("240"));
  },
};

export const RejectsInvalidPage: Story = {
  args: { page: 5 },
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    // Letters are ignored, and a page past the last one is not accepted.
    await userEvent.clear(input);
    await userEvent.type(input, "9x99{Enter}");
    await waitFor(() => expect(input).toHaveValue("5"));
  },
};

export const ShowsRowRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("1 - 10 of 2495")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Next Page" }));
    await expect(
      await canvas.findByText("11 - 20 of 2495"),
    ).toBeInTheDocument();

    // The last page is partial, so the range stops at the item count.
    await userEvent.click(canvas.getByRole("button", { name: "Last Page" }));
    await expect(
      await canvas.findByText("2491 - 2495 of 2495"),
    ).toBeInTheDocument();
  },
};
