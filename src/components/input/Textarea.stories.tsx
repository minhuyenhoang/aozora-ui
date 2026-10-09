import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Input/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Description",
    description: "Provide enough detail to help others understand your request.",
    placeholder: "Enter a description",
    size: "md",
    rows: 5,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    tooltip: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
    rows: { control: "number" },
    cols: { control: "number" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /Description/ });

    await expect(textarea).toHaveAttribute("rows", "5");
    await expect(textarea).toHaveAccessibleDescription(
      "Provide enough detail to help others understand your request.",
    );

    // Enter starts a new line instead of submitting.
    await userEvent.type(textarea, "First line{Enter}Second line");
    await expect(textarea).toHaveValue("First line\nSecond line");
  },
};

export const Invalid: Story = {
  args: { isInvalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("textbox", { name: /Description/ }),
    ).toBeInvalid();
    await expect(
      canvas.getByText(
        "Provide enough detail to help others understand your request.",
      ),
    ).toHaveAttribute("slot", "errorMessage");
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", {
      name: /Description/,
    });

    await expect(textarea).toBeDisabled();
    await userEvent.type(textarea, "Ignored");
    await expect(textarea).toHaveValue("");
  },
};
