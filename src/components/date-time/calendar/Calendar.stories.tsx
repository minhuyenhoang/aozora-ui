import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Calendar } from "./Calendar";

const selectedDate = parseDate("2026-10-08");

const meta = {
  title: "Components/Date Time/Calendar/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Appointment date",
    defaultValue: selectedDate,
    highlightedDates: [selectedDate, parseDate("2026-10-15")],
  },
  argTypes: {
    "aria-label": { control: "text" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-primary px-6 py-5 shadow-lg ring-1 ring-secondary_alt">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Calendar>;

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
    const isSelected = (name: RegExp) =>
      day(name).closest("td")!.getAttribute("aria-selected") === "true";

    await expect(
      canvas.getByRole("grid", { name: /October 2026/ }),
    ).toBeVisible();
    await expect(isSelected(/October 8, 2026/)).toBe(true);

    // Clicking another day moves the selection to it.
    await choose(/October 20, 2026/);
    await expect(isSelected(/October 20, 2026/)).toBe(true);
    await expect(isSelected(/October 8, 2026/)).toBe(false);

    // The arrows move between months.
    await userEvent.click(canvas.getAllByRole("button", { name: "Next" })[0]);
    await expect(
      canvas.getByRole("grid", { name: /November 2026/ }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await expect(isSelected(/October 20, 2026/)).toBe(true);
  },
};

export const WithUnavailableDates: Story = {
  args: {
    isDateUnavailable: (date) => date.day === 11 || date.day === 12,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (name: RegExp) => canvas.getByRole("button", { name });
    // Days are chosen with the keyboard: focus one, then press Enter.
    const choose = async (name: RegExp) => {
      day(name).focus();
      await userEvent.keyboard("{Enter}");
    };
    const isSelected = (name: RegExp) =>
      day(name).closest("td")!.getAttribute("aria-selected") === "true";

    await expect(day(/October 11, 2026/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(day(/October 12, 2026/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    // An unavailable day cannot be selected.
    await choose(/October 11, 2026/);
    await expect(isSelected(/October 11, 2026/)).toBe(false);
    await expect(isSelected(/October 8, 2026/)).toBe(true);

    await choose(/October 13, 2026/);
    await expect(isSelected(/October 13, 2026/)).toBe(true);
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (name: RegExp) => canvas.getByRole("button", { name });
    // Days are chosen with the keyboard: focus one, then press Enter.
    const choose = async (name: RegExp) => {
      day(name).focus();
      await userEvent.keyboard("{Enter}");
    };
    const isSelected = (name: RegExp) =>
      day(name).closest("td")!.getAttribute("aria-selected") === "true";

    // The value is shown but cannot be changed.
    await choose(/October 20, 2026/);
    await expect(isSelected(/October 20, 2026/)).toBe(false);
    await expect(isSelected(/October 8, 2026/)).toBe(true);
  },
};
