import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RadioGroup } from "./group/RadioGroup";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Control/Radio",
  component: Radio,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    value: "email",
    label: "Email",
    description: "Receive notifications by email.",
    size: "sm",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
    isDisabled: { control: "boolean" },
  },
  render: (args) => (
    <RadioGroup aria-label="Notification method">
      <Radio {...args} />
    </RadioGroup>
  ),
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label alone names the radio, the description describes it.
    const radio = canvas.getByRole("radio", { name: "Email" });

    await expect(
      canvas.getByRole("radiogroup", { name: "Notification method" }),
    ).toBeVisible();
    await expect(radio).not.toBeChecked();
    await expect(radio).toHaveAccessibleDescription(
      "Receive notifications by email.",
    );

    // The description is part of the clickable area too.
    await userEvent.click(canvas.getByText("Receive notifications by email."));
    await expect(radio).toBeChecked();

    // A selected radio stays selected when clicked again.
    await userEvent.click(canvas.getByText("Email"));
    await expect(radio).toBeChecked();
  },
};

export const Medium: Story = {
  args: { size: "md" },
  play: async ({ canvasElement }) => {
    // Without a group size, the radio keeps its own.
    await expect(within(canvasElement).getByText("Email")).toHaveClass(
      "text-md",
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio", { name: "Email" });

    await expect(radio).toBeDisabled();

    // It cannot be focused or selected.
    await userEvent.tab();
    await expect(radio).not.toHaveFocus();
    await userEvent.click(canvas.getByText("Email"), {
      pointerEventsCheck: 0,
    });
    await expect(radio).not.toBeChecked();
  },
};
