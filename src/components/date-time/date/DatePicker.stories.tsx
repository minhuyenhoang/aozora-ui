import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Components/Date Time/Date/DatePicker",
  component: DatePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Select a due date",
    defaultValue: parseDate("2026-10-08"),
    applyLabel: "Apply",
    cancelLabel: "Cancel",
    size: "sm",
  },
  argTypes: {
    "aria-label": { control: "text" },
    applyLabel: { control: "text" },
    cancelLabel: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: /Calendar/ });

    await expect(trigger).toHaveTextContent("Oct 8, 2026");
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");

    // Choosing a day closes the calendar and shows the new date.
    within(dialog).getByRole("button", { name: /October 20, 2026/ }).focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveTextContent("Oct 20, 2026");
  },
};

export const Empty: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Calendar/ });

    await expect(trigger).toHaveTextContent("Select date");
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");

    // Cancel closes the calendar and leaves the field empty.
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveTextContent("Select date");
  },
};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await screen.findByRole("dialog");

    await expect(
      within(dialog)
        .getByRole("button", { name: /October 8, 2026/ })
        .closest("td"),
    ).toHaveAttribute("aria-selected", "true");

    await userEvent.click(within(dialog).getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(
      within(canvasElement).getByRole("button", { name: /Calendar/ }),
    ).toHaveTextContent("Oct 8, 2026");
  },
};
