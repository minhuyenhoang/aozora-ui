import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InputBase } from "../../base/input/InputBase";
import { InputGroup } from "./InputGroup";
import { InputPrefix } from "./InputPrefix";

const meta = {
  title: "Components/Input/InputGroup",
  component: InputGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Website",
    description: "Enter the address of your website.",
    size: "md",
    leadingAddon: <InputPrefix>https://</InputPrefix>,
    children: <InputBase placeholder="example.com" />,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("example.com");
    const prefix = canvas.getByText("https://");

    await expect(canvas.getByText("Website")).toBeVisible();
    await expect(
      canvas.getByText("Enter the address of your website."),
    ).toBeVisible();

    // The addon sits before the input, and is not part of its value.
    await expect(prefix.getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left + 1,
    );
    await userEvent.type(input, "acme.com");
    await expect(input).toHaveValue("acme.com");
  },
};

export const WithTrailingAddon: Story = {
  args: {
    leadingAddon: undefined,
    trailingAddon: <InputPrefix>.com</InputPrefix>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("example.com");

    await expect(canvas.queryByText("https://")).toBeNull();
    // The addon sits after the input.
    await expect(
      canvas.getByText(".com").getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(input.getBoundingClientRect().right - 1);
  },
};

export const WithInlinePrefix: Story = {
  args: {
    leadingAddon: undefined,
    prefix: "https://",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("example.com");
    const prefix = canvas.getByText("https://");

    // The prefix is drawn inside the field, before the typed text.
    await expect(prefix).toBeVisible();
    await expect(prefix.getBoundingClientRect().left).toBeLessThan(
      input.getBoundingClientRect().right,
    );
    await userEvent.type(input, "acme.com");
    await expect(input).toHaveValue("acme.com");
  },
};
