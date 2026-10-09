import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Separator } from "./Separator";

const meta = {
  title: "Components/Layout/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  render: (args) => (
    <div
      className={
        args.orientation === "vertical"
          ? "flex h-10 items-center gap-3 text-sm text-secondary"
          : "flex w-64 flex-col gap-3 text-sm text-secondary"
      }
    >
      <span>Profile</span>
      <Separator {...args} />
      <span>Billing</span>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    const { width, height } = separator.getBoundingClientRect();

    // A horizontal line fills the width and is one pixel tall.
    await expect(separator).not.toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    await expect(height).toBe(1);
    await expect(width).toBe(256);
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    const { width, height } = separator.getBoundingClientRect();

    // A vertical line is one pixel wide and as tall as its container.
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(width).toBe(1);
    await expect(height).toBe(40);
  },
};

/** `className` adds to, or overrides, the default look. */
export const CustomClassName: Story = {
  args: { className: "h-0.5 w-8 bg-border-primary" },
  play: async ({ canvasElement }) => {
    const { width, height } = within(canvasElement)
      .getByRole("separator")
      .getBoundingClientRect();

    await expect(width).toBe(32);
    await expect(height).toBe(2);
  },
};
