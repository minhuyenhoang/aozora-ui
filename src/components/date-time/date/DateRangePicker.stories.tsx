import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { DateRangePicker } from "./DateRangePicker";

const presets = {
  lastWeek: {
    label: "Last week",
    value: {
      start: parseDate("2026-09-28"),
      end: parseDate("2026-10-04"),
    },
  },
  lastMonth: {
    label: "Last month",
    value: {
      start: parseDate("2026-09-01"),
      end: parseDate("2026-09-30"),
    },
  },
  lastYear: {
    label: "Last year",
    value: {
      start: parseDate("2025-01-01"),
      end: parseDate("2025-12-31"),
    },
  },
};

const meta = {
  title: "Components/Date Time/Date/DateRangePicker",
  component: DateRangePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Select a date range",
    defaultValue: {
      start: parseDate("2026-10-08"),
      end: parseDate("2026-10-14"),
    },
    presets,
    size: "sm",
  },
  argTypes: {
    "aria-label": { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Calendar/,
    });

    await expect(trigger).toHaveTextContent("Oct 8, 2026 – Oct 14, 2026");
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");

    await expect(
      dialog.querySelectorAll("td[aria-selected=true]"),
    ).toHaveLength(7);

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveTextContent("Oct 8, 2026 – Oct 14, 2026");
  },
};

export const Empty: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Calendar/,
    });

    await expect(trigger).toHaveTextContent("Select dates");
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");

    await expect(dialog.querySelectorAll("td[aria-selected=true]")).toHaveLength(
      0,
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveTextContent("Select dates");
  },
};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await screen.findByRole("dialog");
    const choose = async (name: RegExp) => {
      within(dialog).getByRole("button", { name }).focus();
      await userEvent.keyboard("{Enter}");
    };

    // Choosing a range keeps the calendar open until it is applied.
    await choose(/October 20, 2026/);
    await choose(/October 22, 2026/);
    await expect(
      within(canvasElement).getByRole("button", {
        name: /Calendar/,
        hidden: true,
      }),
    ).toHaveTextContent("Oct 20, 2026 – Oct 22, 2026");
    await expect(dialog).toBeVisible();

    await userEvent.click(within(dialog).getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};
