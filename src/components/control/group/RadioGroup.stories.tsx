import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Radio } from "../Radio";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/Control/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Notification method",
    defaultValue: "email",
    size: "sm",
    children: null,
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="email" label="Email" description="Get updates by email." />
      <Radio value="sms" label="SMS" description="Get updates by text message." />
      <Radio value="none" label="Do not notify me" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = (name: RegExp) => canvas.getByRole("radio", { name });

    await expect(
      canvas.getByRole("radiogroup", { name: "Notification method" }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("radio")).toHaveLength(3);
    await expect(radio(/Email/)).toBeChecked();

    // Only one option is selected at a time.
    await userEvent.click(radio(/SMS/));
    await expect(radio(/SMS/)).toBeChecked();
    await expect(radio(/Email/)).not.toBeChecked();

    // Arrow keys move the selection to the next option.
    await userEvent.keyboard("{ArrowDown}");
    await expect(radio(/Do not notify me/)).toBeChecked();
    await expect(radio(/Do not notify me/)).toHaveFocus();
  },
};

export const Medium: Story = {
  args: { size: "md" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("radio", { name: /Email/ })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: /Do not notify me/ }));
    await expect(
      canvas.getByRole("radio", { name: /Do not notify me/ }),
    ).toBeChecked();
  },
};
