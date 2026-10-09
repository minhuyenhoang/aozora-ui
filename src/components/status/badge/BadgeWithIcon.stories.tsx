import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { BadgeWithIcon } from "./BadgeWithIcon";

const meta = {
  title: "Components/Status/Badge/BadgeWithIcon",
  component: BadgeWithIcon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Verified",
    type: "pill-color",
    size: "md",
    color: "brand",
    iconLeading: IconCheck,
  },
  argTypes: {
    children: { control: "text", name: "Label" },
    iconLeading: { control: false },
    iconTrailing: { control: false },
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
} satisfies Meta<typeof BadgeWithIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeadingIcon: Story = {
  args: {
    iconLeading: IconArrowLeft,
    iconTrailing: undefined,
  },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Verified");

    await expect(badge.querySelectorAll("svg")).toHaveLength(1);
    // The icon comes before the label.
    await expect(badge.firstChild).toBe(
      badge.querySelector(".tabler-icon-arrow-left"),
    );
  },
};

export const TrailingIcon: Story = {
  args: {
    iconLeading: undefined,
    iconTrailing: IconArrowRight,
  },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Verified");

    await expect(badge.querySelectorAll("svg")).toHaveLength(1);
    // The icon comes after the label.
    await expect(badge.lastChild).toBe(
      badge.querySelector(".tabler-icon-arrow-right"),
    );
  },
};
