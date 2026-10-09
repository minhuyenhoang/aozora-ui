import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BadgeWithButton } from "./BadgeWithButton";

const meta = {
  title: "Components/Status/Badge/BadgeWithButton",
  component: BadgeWithButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Design",
    buttonLabel: "Remove Design badge",
    type: "pill-color",
    size: "md",
    color: "brand",
    onButtonClick: fn(),
  },
  argTypes: {
    children: { control: "text", name: "Label" },
    buttonLabel: { control: "text" },
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
} satisfies Meta<typeof BadgeWithButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Remove Design badge" });

    await expect(canvas.getByText("Design")).toBeVisible();

    await userEvent.click(button);
    await expect(args.onButtonClick).toHaveBeenCalledTimes(1);

    // The button works from the keyboard too.
    await userEvent.keyboard("{Enter}");
    await expect(args.onButtonClick).toHaveBeenCalledTimes(2);
  },
};
