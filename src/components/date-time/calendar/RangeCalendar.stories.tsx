import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RangeCalendar } from "./RangeCalendar";

const meta = {
  title: "Components/Date Time/Calendar/RangeCalendar",
  component: RangeCalendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Trip dates",
    defaultValue: {
      start: parseDate("2026-10-08"),
      end: parseDate("2026-10-14"),
    },
    highlightedDates: [parseDate("2026-10-08")],
    visibleDuration: { months: 1 },
    showOutOfRangeDates: false,
  },
  argTypes: {
    "aria-label": { control: "text" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    showOutOfRangeDates: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-primary shadow-lg ring-1 ring-secondary_alt">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (name: RegExp) => canvas.getByRole("button", { name });
    // Days are chosen with the keyboard: focus one, then press Enter.
    const choose = async (name: RegExp) => {
      day(name).focus();
      await userEvent.keyboard("{Enter}");
    };
    const selectedCount = () =>
      canvasElement.querySelectorAll("td[aria-selected=true]").length;

    await expect(canvas.getAllByRole("grid")).toHaveLength(1);
    // The 8th to the 14th is seven days.
    await expect(selectedCount()).toBe(7);
    // Days of the neighboring months are left out.
    await expect(
      canvas.queryByRole("button", { name: /September 30, 2026/ }),
    ).toBeNull();

    // Two clicks choose the start and the end of a new range.
    await choose(/October 20, 2026/);
    await choose(/October 22, 2026/);
    await expect(selectedCount()).toBe(3);
    await expect(day(/October 21, 2026/).closest("td")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const TwoMonths: Story = {
  args: { visibleDuration: { months: 2 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (name: RegExp) => canvas.getByRole("button", { name });
    // Days are chosen with the keyboard: focus one, then press Enter.
    const choose = async (name: RegExp) => {
      day(name).focus();
      await userEvent.keyboard("{Enter}");
    };
    const selectedCount = () =>
      canvasElement.querySelectorAll("td[aria-selected=true]").length;

    await expect(canvas.getAllByRole("grid")).toHaveLength(2);
    await expect(day(/October 8, 2026/)).toBeVisible();
    await expect(day(/November 8, 2026/)).toBeVisible();

    // A range can run from one month into the next.
    await choose(/October 30, 2026/);
    await choose(/November 2, 2026/);
    await expect(selectedCount()).toBe(4);
  },
};

export const WithOutOfRangeDates: Story = {
  args: { showOutOfRangeDates: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (name: RegExp) => canvas.getByRole("button", { name });
    const selectedCount = () =>
      canvasElement.querySelectorAll("td[aria-selected=true]").length;

    // The last days of September fill the first week of October.
    await expect(day(/September 27, 2026/)).toBeVisible();
    await expect(day(/September 30, 2026/)).toBeVisible();
    await expect(selectedCount()).toBe(7);
  },
};
