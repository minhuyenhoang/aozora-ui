import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DateField } from "./DateField";

const meta = {
  title: "Components/Date Time/Date/DateField",
  component: DateField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Start date",
    description: "Enter the date the project begins.",
    placeholder: "Select a date",
    defaultValue: parseDate("2026-10-08"),
    size: "md",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    tooltip: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    granularity: { control: "select", options: ["day", "hour", "minute", "second"] },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    isRequired: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const segment = (name: RegExp) => canvas.getByRole("spinbutton", { name });

    await expect(canvas.getByText("Start date")).toBeVisible();
    await expect(segment(/month/)).toHaveTextContent("10");
    await expect(segment(/day/)).toHaveTextContent("8");
    await expect(segment(/year/)).toHaveTextContent("2026");
    await expect(
      canvas.getByText("Enter the date the project begins."),
    ).toBeVisible();

    // Arrow keys step the focused part, and typing replaces it.
    await userEvent.click(segment(/month/));
    await userEvent.keyboard("{ArrowUp}");
    await expect(segment(/month/)).toHaveTextContent("11");
    await userEvent.keyboard("{ArrowRight}25");
    await expect(segment(/day/)).toHaveTextContent("25");
  },
};

export const Empty: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const segment = (name: RegExp) => canvas.getByRole("spinbutton", { name });

    await expect(segment(/month/)).toHaveAttribute("aria-valuetext", "Empty");

    // Typing fills each part and moves on to the next.
    await userEvent.click(segment(/month/));
    await userEvent.keyboard("12252026");
    await expect(segment(/month/)).toHaveTextContent("12");
    await expect(segment(/day/)).toHaveTextContent("25");
    await expect(segment(/year/)).toHaveTextContent("2026");
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("spinbutton", { name: /month/ })).toBeVisible();
    // A required field marks its label with an asterisk.
    await expect(
      canvasElement.querySelector("[data-label]"),
    ).toHaveTextContent(/Start date\s*\*/);
  },
};
