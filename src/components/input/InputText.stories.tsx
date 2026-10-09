import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { IconMail } from "@tabler/icons-react";
import { InputText } from "./InputText";

const meta = {
  title: "Components/Input/InputText",
  component: InputText,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Email",
    placeholder: "you@example.com",
    description: "We will only use this address for account updates.",
    size: "md",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Email/ });

    await expect(input).toHaveAttribute("placeholder", "you@example.com");
    await expect(input).toHaveAccessibleDescription(
      "We will only use this address for account updates.",
    );

    // Clicking the label focuses the input.
    await userEvent.click(canvas.getByText("Email"));
    await expect(input).toHaveFocus();
    await userEvent.keyboard("olivia@example.com");
    await expect(input).toHaveValue("olivia@example.com");
  },
};

export const WithIcon: Story = {
  args: { icon: IconMail },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Email/ });
    const icon = canvasElement.querySelector(".tabler-icon-mail")!;

    // The icon is inside the field, at its start.
    await expect(icon).toBeVisible();
    await expect(icon.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      input.getBoundingClientRect().left,
    );
    await expect(icon.getBoundingClientRect().right).toBeLessThan(
      input.getBoundingClientRect().right,
    );
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    description: "Must contain at least eight characters.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Enter your password");
    const toggle = canvas.getByRole("button", {
      name: "Toggle password visibility",
    });

    await userEvent.type(input, "hunter2!");
    await expect(input).toHaveAttribute("type", "password");

    // The button shows the password, then hides it again.
    await userEvent.click(toggle);
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("hunter2!");
    await userEvent.click(toggle);
    await expect(input).toHaveAttribute("type", "password");
  },
};

export const Invalid: Story = {
  args: { isInvalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Email/ });

    await expect(input).toBeInvalid();
    // The description is announced as the error message.
    await expect(
      canvas.getByText("We will only use this address for account updates."),
    ).toHaveAttribute("slot", "errorMessage");
  },
};
