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
  },
  render: (args) => (
    <RadioGroup aria-label="Notification method" defaultValue="email">
      <Radio {...args} />
    </RadioGroup>
  ),
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio", { name: /Email/ });

    await expect(
      canvas.getByRole("radiogroup", { name: "Notification method" }),
    ).toBeVisible();
    await expect(radio).toBeChecked();
    await expect(
      canvas.getByText("Receive notifications by email."),
    ).toBeVisible();

    // A selected radio stays selected when clicked again.
    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole("radio", { name: /Email/ });

    await expect(radio).toBeDisabled();
    await userEvent.tab();
    await expect(radio).not.toHaveFocus();
  },
};
