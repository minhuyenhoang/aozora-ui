import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InputNumber } from "./InputNumber";

const meta = {
  title: "Components/Input/InputNumber",
  component: InputNumber,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Quantity",
    description: "Choose a value between 1 and 10.",
    defaultValue: 1,
    minValue: 1,
    maxValue: 10,
    size: "md",
    orientation: "vertical",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    minValue: { control: "number" },
    maxValue: { control: "number" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Quantity/ });
    const increase = canvas.getByRole("button", { name: /Increase/ });
    const decrease = canvas.getByRole("button", { name: /Decrease/ });

    await expect(input).toHaveValue("1");
    // The value starts at the minimum, so it cannot go lower.
    await expect(decrease).toBeDisabled();

    await userEvent.click(increase);
    await expect(input).toHaveValue("2");
    await expect(decrease).toBeEnabled();

    // A typed value past the maximum is brought back to it on blur.
    await userEvent.clear(input);
    await userEvent.type(input, "50");
    await userEvent.tab();
    await expect(input).toHaveValue("10");
    await expect(increase).toBeDisabled();
  },
};

export const HorizontalControls: Story = {
  args: { orientation: "horizontal" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Quantity/ });
    const increase = canvas.getByRole("button", { name: /Increase/ });
    const decrease = canvas.getByRole("button", { name: /Decrease/ });

    // The buttons sit on either side of the input.
    await expect(decrease.getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left + 1,
    );
    await expect(increase.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      input.getBoundingClientRect().right - 1,
    );

    await userEvent.click(increase);
    await userEvent.click(increase);
    await expect(input).toHaveValue("3");
    await userEvent.click(decrease);
    await expect(input).toHaveValue("2");
  },
};

/** Thousands separators are added while typing, not only on blur. */
export const GroupsThousands: Story = {
  args: {
    label: "Amount",
    description: "Digits are grouped as you type.",
    defaultValue: 2500000,
    minValue: undefined,
    maxValue: undefined,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole<HTMLInputElement>(
      "textbox",
      { name: /Amount/ },
    );

    await expect(input).toHaveValue("2,500,000");

    // Each keystroke regroups the digits.
    await userEvent.clear(input);
    await userEvent.type(input, "1234");
    await expect(input).toHaveValue("1,234");
    await userEvent.type(input, "567");
    await expect(input).toHaveValue("1,234,567");

    // Only the whole part is grouped, so decimals are typed as usual.
    await userEvent.type(input, ".5");
    await expect(input).toHaveValue("1,234,567.5");

    // Deleting digits regroups the ones that are left.
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");
    await expect(input).toHaveValue("12,345");

    // The caret stays where it was when typing in the middle.
    input.setSelectionRange(1, 1);
    await userEvent.keyboard("9");
    await expect(input).toHaveValue("192,345");
    await expect(input.selectionStart).toBe(2);
    await userEvent.keyboard("8");
    await expect(input).toHaveValue("1,982,345");
    await expect(input.selectionStart).toBe(4);

    // The value itself is the plain number.
    await userEvent.tab();
    await expect(input).toHaveValue("1,982,345");
  },
};

/** A currency keeps its symbol while the digits are grouped. */
export const Currency: Story = {
  args: {
    label: "Price",
    description: "Enter the price in US dollars.",
    defaultValue: 1500,
    minValue: 0,
    maxValue: undefined,
    formatOptions: { style: "currency", currency: "USD" },
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: /Price/,
    });

    await expect(input).toHaveValue("$1,500.00");

    await userEvent.clear(input);
    await userEvent.type(input, "$2500000");
    await expect(input).toHaveValue("$2,500,000");

    // Leaving the field adds the cents.
    await userEvent.tab();
    await expect(input).toHaveValue("$2,500,000.00");
  },
};

/** `useGrouping: false` turns the separators off, for a year or an ID. */
export const WithoutGrouping: Story = {
  args: {
    label: "Year",
    description: "Enter a four-digit year.",
    defaultValue: 2026,
    minValue: undefined,
    maxValue: undefined,
    formatOptions: { useGrouping: false },
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: /Year/,
    });

    await expect(input).toHaveValue("2026");

    await userEvent.clear(input);
    await userEvent.type(input, "12345");
    await expect(input).toHaveValue("12345");
    await userEvent.tab();
    await expect(input).toHaveValue("12345");
  },
};
