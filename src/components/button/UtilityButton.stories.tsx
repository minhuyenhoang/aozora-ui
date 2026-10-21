import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconSettings } from "@tabler/icons-react";
import { UtilityButton } from "./UtilityButton";

const meta = {
  title: "Components/Button/UtilityButton",
  component: UtilityButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    icon: IconSettings,
    tooltip: "Settings",
    color: "secondary",
    size: "sm",
    onPress: fn(),
  },
  argTypes: {
    color: { control: "inline-radio", options: ["secondary", "tertiary"] },
    size: { control: "inline-radio", options: ["xs", "sm"] },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof UtilityButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Settings",
    });

    await expect(getComputedStyle(button).cursor).toBe("pointer");
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Settings",
    });

    await expect(button).toBeDisabled();
    await expect(getComputedStyle(button).cursor).toBe("not-allowed");
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const DisabledLink: Story = {
  args: { isDisabled: true },
  // Only the props a link takes, since the args are typed for a button.
  render: ({ icon, tooltip, isDisabled }) => (
    <UtilityButton href="/settings" {...{ icon, tooltip, isDisabled }} />
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Settings" });

    // A link has no disabled attribute, but shows the same cursor.
    await expect(getComputedStyle(link).cursor).toBe("not-allowed");
    await expect(getComputedStyle(link).opacity).toBe("0.5");
  },
};
