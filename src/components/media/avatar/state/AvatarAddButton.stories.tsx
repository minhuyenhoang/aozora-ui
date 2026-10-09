import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { AvatarAddButton } from "./AvatarAddButton";

const meta = {
  title: "Components/Avatar/AvatarAddButton",
  component: AvatarAddButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    size: "md",
    title: "Add user",
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md"] },
  },
} satisfies Meta<typeof AvatarAddButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Add user",
    });

    // Focusing the button with the keyboard shows its tooltip.
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Add user",
    );
  },
};
