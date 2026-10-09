import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { IconCheck } from "@tabler/icons-react";
import { BadgeIcon } from "./BadgeIcon";

const meta = {
  title: "Components/Status/Badge/BadgeIcon",
  component: BadgeIcon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    icon: IconCheck,
    type: "pill-color",
    size: "md",
    color: "success",
  },
  argTypes: {
    icon: { control: false },
    type: {
      control: "select",
      options: ["pill-color", "color", "modern"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: [
        "gray",
        "brand",
        "destructive",
        "warning",
        "success",
        "slate",
        "sky",
        "blue",
        "indigo",
        "purple",
        "pink",
        "orange",
      ],
    },
  },
} satisfies Meta<typeof BadgeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector(".tabler-icon-check")!;
    const badge = icon.parentElement!;

    await expect(icon).toBeVisible();
    // An icon badge has no label, and is as wide as it is tall.
    await expect(badge).toHaveTextContent("");
    await expect(badge.getBoundingClientRect().width).toBe(
      badge.getBoundingClientRect().height,
    );
  },
};
