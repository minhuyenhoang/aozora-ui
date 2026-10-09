import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Status/Badge/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Badge",
    type: "pill-color",
    size: "md",
    color: "brand",
  },
  argTypes: {
    children: { control: "text", name: "Label" },
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
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Badge");

    await expect(badge).toBeVisible();
    // The pill type is fully rounded.
    await expect(
      parseFloat(getComputedStyle(badge).borderTopLeftRadius),
    ).toBeGreaterThanOrEqual(badge.getBoundingClientRect().height / 2);
  },
};

export const Modern: Story = {
  args: { type: "modern", color: "gray" },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Badge");

    await expect(badge).toBeVisible();
    // The modern type has slightly rounded corners, not a pill shape.
    await expect(
      parseFloat(getComputedStyle(badge).borderTopLeftRadius),
    ).toBeLessThan(badge.getBoundingClientRect().height / 2);
  },
};
