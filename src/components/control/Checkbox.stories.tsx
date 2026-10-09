import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Control/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Remember me",
    description: "Save my login details for next time.",
    size: "sm",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: /Remember me/ });

    await expect(checkbox).not.toBeChecked();
    await expect(
      canvas.getByText("Save my login details for next time."),
    ).toBeVisible();

    // Clicking the label toggles it, and so does Space.
    await userEvent.click(canvas.getByText("Remember me"));
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

export const Selected: Story = {
  args: { defaultSelected: true },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: /Remember me/,
    });

    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const Indeterminate: Story = {
  args: { isIndeterminate: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("checkbox", { name: /Remember me/ }),
    ).toBePartiallyChecked();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: /Remember me/ });

    await expect(checkbox).toBeDisabled();

    // It cannot be focused or toggled.
    await userEvent.tab();
    await expect(checkbox).not.toHaveFocus();
    await userEvent.click(canvas.getByText("Remember me"), {
      pointerEventsCheck: 0,
    });
    await expect(checkbox).not.toBeChecked();
  },
};
