import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
    required: { control: "boolean" },
    isClearable: { control: "boolean" },
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

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("textbox", { name: /Email/ }),
    ).toBeRequired();
    const indicator = canvas.getByText("*");

    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveClass("text-destructive-primary");
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

export const Clearable: Story = {
  args: { isClearable: true, onClear: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Email/ });

    // The button only shows while there is something to clear.
    await expect(
      canvas.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
    await userEvent.type(input, "olivia@example.com");

    // Pressing it empties the input, calls back, and keeps the focus there.
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledOnce();
    await expect(
      canvas.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  },
};

export const ClearableInvalid: Story = {
  args: {
    isClearable: true,
    isInvalid: true,
    defaultValue: "olivia@",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clear = canvas.getByRole("button", { name: "Clear" });
    const invalidIcon = canvasElement.querySelector(
      ".tabler-icon-info-circle",
    )!;

    // The clear button moves aside for the invalid icon.
    await expect(invalidIcon).toBeVisible();
    await expect(clear.getBoundingClientRect().right).toBeLessThanOrEqual(
      invalidIcon.getBoundingClientRect().left,
    );
  },
};

export const ClearablePassword: Story = {
  args: {
    ...Password.args,
    isClearable: true,
    defaultValue: "hunter2!",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clear = canvas.getByRole("button", { name: "Clear" });
    const toggle = canvas.getByRole("button", {
      name: "Toggle password visibility",
    });

    // Both buttons fit at the end without overlapping.
    await expect(clear.getBoundingClientRect().right).toBeLessThanOrEqual(
      toggle.getBoundingClientRect().left,
    );
    await userEvent.click(clear);
    await expect(
      canvas.getByPlaceholderText("Enter your password"),
    ).toHaveValue("");
  },
};
