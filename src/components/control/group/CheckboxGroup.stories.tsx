import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "../Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const meta = {
  title: "Components/Control/CheckboxGroup",
  component: CheckboxGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Notification channels",
    description: "Choose how you want to receive account updates.",
    defaultValue: ["email"],
    size: "sm",
    selectAll: true,
    onChange: fn(),
    children: null,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    required: { control: "boolean" },
    selectAll: { control: "boolean" },
    selectAllLabel: { control: "text" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <CheckboxGroup {...args}>
      <Checkbox
        value="email"
        label="Email"
        description="Get updates by email."
      />
      <Checkbox
        value="sms"
        label="SMS"
        description="Get updates by text message."
      />
      <Checkbox value="push" label="Push notifications" />
    </CheckboxGroup>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = (name: string) =>
      canvas.getByRole("checkbox", { name });
    const selectAll = checkbox("Select all");

    await expect(
      canvas.getByRole("group", { name: "Notification channels" }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(4);
    await expect(selectAll).toBePartiallyChecked();
    await expect(checkbox("Email")).toBeChecked();

    // An indeterminate select-all checkbox selects every option.
    await userEvent.click(selectAll);
    for (const option of ["Email", "SMS", "Push notifications"]) {
      await expect(checkbox(option)).toBeChecked();
    }
    await expect(selectAll).toBeChecked();

    // Clearing one option returns select-all to its indeterminate state.
    await userEvent.click(checkbox("SMS"));
    await expect(selectAll).toBePartiallyChecked();

    // Select all can restore all options, then clear them together.
    await userEvent.click(selectAll);
    await expect(selectAll).toBeChecked();
    await userEvent.click(selectAll);
    for (const option of ["Email", "SMS", "Push notifications"]) {
      await expect(checkbox(option)).not.toBeChecked();
    }
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const WithoutSelectAll: Story = {
  args: { selectAll: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("checkbox")).toHaveLength(3);
    await expect(
      canvas.queryByRole("checkbox", { name: "Select all" }),
    ).not.toBeInTheDocument();
  },
};

export const Medium: Story = {
  args: { size: "md" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Email")).toHaveClass("text-md");
    await expect(canvas.getByText("Select all")).toHaveClass("text-md");
  },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal", selectAll: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("group"),
    ).toHaveAttribute("aria-orientation", "horizontal");
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const checkbox of canvas.getAllByRole("checkbox")) {
      await expect(checkbox).toBeDisabled();
    }
  },
};
