import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { BadgeWithDot } from "./BadgeWithDot";

const meta = {
  title: "Components/Status/Badge/BadgeWithDot",
  component: BadgeWithDot,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Active",
    type: "pill-color",
    size: "md",
    color: "success",
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
} satisfies Meta<typeof BadgeWithDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Active");
    const dot = badge.querySelector("svg")!;

    // The dot comes before the label.
    await expect(dot).toBeVisible();
    await expect(badge.firstElementChild).toBe(dot);
    await expect(dot.nextSibling?.textContent).toBe("Active");
  },
};
