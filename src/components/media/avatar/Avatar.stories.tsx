import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { IconUser } from "@tabler/icons-react";
import { Avatar } from "./Avatar";

const meta = {
  title: "Components/Media/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    size: "md",
    initials: "AS",
    alt: "Alex Smith",
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "2xl"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("AS")).toBeVisible();
    // Without a `src` there is no image, only the initials.
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const PlaceholderIcon: Story = {
  args: {
    initials: undefined,
    placeholderIcon: IconUser,
  },
  play: async ({ canvasElement }) => {
    // The icon stands in when there is no image and no initials.
    await expect(
      canvasElement.querySelector(".tabler-icon-user"),
    ).toBeVisible();
    await expect(within(canvasElement).queryByText("AS")).toBeNull();
  },
};

export const RoundedWithBorder: Story = {
  args: {
    size: "lg",
    border: true,
    initials: "UI",
  },
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector<HTMLElement>("[data-avatar]")!;

    await expect(within(avatar).getByText("UI")).toBeVisible();
    await expect(avatar).toHaveClass("ring-1", "rounded-full");
    // The large size is 48 pixels square.
    await expect(avatar.getBoundingClientRect().width).toBe(48);
    await expect(avatar.getBoundingClientRect().height).toBe(48);
  },
};
