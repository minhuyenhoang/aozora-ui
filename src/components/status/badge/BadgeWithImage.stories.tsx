import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { BadgeWithImage } from "./BadgeWithImage";

const avatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%237F56D9'/%3E%3Ccircle cx='16' cy='12' r='5' fill='white'/%3E%3Cpath d='M7 29c1-6 4-9 9-9s8 3 9 9' fill='white'/%3E%3C/svg%3E";

const meta = {
  title: "Components/Status/Badge/BadgeWithImage",
  component: BadgeWithImage,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Olivia Rhye",
    imgSrc: avatar,
    type: "pill-color",
    size: "md",
    color: "gray",
  },
  argTypes: {
    children: { control: "text", name: "Label" },
    imgSrc: { control: "text" },
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
} satisfies Meta<typeof BadgeWithImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const badge = within(canvasElement).getByText("Olivia Rhye");
    const image = within(badge).getByRole<HTMLImageElement>("img");

    // The image loads, and comes before the label.
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
    await expect(image).toHaveAttribute("src", args.imgSrc);
    await expect(badge.firstChild).toBe(image);
    await expect(image.getBoundingClientRect().width).toBe(16);
  },
};
