import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Toggle } from "./Toggle";

const meta = {
  title: "Components/Control/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Email notifications",
    description: "Receive product news and account updates.",
    size: "sm",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
    slim: { control: "boolean" },
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: /Email notifications/ });

    await expect(toggle).not.toBeChecked();
    await expect(
      canvas.getByText("Receive product news and account updates."),
    ).toBeVisible();

    // Clicking the label turns it on, and Space turns it off again.
    await userEvent.click(canvas.getByText("Email notifications"));
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
  },
};

export const Slim: Story = {
  args: { slim: true },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch", {
      name: /Email notifications/,
    });

    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};
