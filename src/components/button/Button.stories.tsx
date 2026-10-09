import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    children: "Button",
    color: "primary",
    size: "sm",
    onPress: fn(),
  },
  argTypes: {
    children: { control: "text", name: "Label" },
    isLoading: { control: "boolean" },
    isDisabled: { control: "boolean" },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "link-color",
        "link-gray",
        "light",
        "primary-destructive",
        "secondary-destructive",
        "tertiary-destructive",
        "link-destructive",
        "light-destructive",
      ],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Button",
    });

    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);

    // The keyboard presses it too.
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

export const LeadingIcon: Story = {
  args: {
    iconLeading: IconPlus,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Button",
    });
    const icon = button.querySelector("[data-icon=leading]")!;

    await expect(icon).toBeVisible();
    await expect(button.querySelector("[data-icon=trailing]")).toBeNull();
    // The icon comes before the label.
    await expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(
      within(button).getByText("Button").getBoundingClientRect().left,
    );
  },
};

export const TrailingIcon: Story = {
  args: {
    iconTrailing: IconArrowRight,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Button",
    });
    const icon = button.querySelector("[data-icon=trailing]")!;

    await expect(icon).toBeVisible();
    await expect(button.querySelector("[data-icon=leading]")).toBeNull();
    // The icon comes after the label.
    await expect(icon.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      within(button).getByText("Button").getBoundingClientRect().right,
    );
  },
};

/** A tinted button, quieter than `primary` and more present than `tertiary`. */
export const Light: Story = {
  args: {
    color: "light",
    children: "Next",
    iconTrailing: IconArrowRight,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Next" });
    const style = getComputedStyle(button);
    const icon = button.querySelector("[data-icon=trailing]")!;

    // It has a tinted fill, with the label in a stronger shade of the tint.
    await expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(style.color).not.toBe(style.backgroundColor);
    // The icon is a lighter shade than the label.
    await expect(getComputedStyle(icon).color).not.toBe(style.color);

    // Hovering deepens the fill.
    const restingFill = style.backgroundColor;

    await userEvent.hover(button);
    await waitFor(() =>
      expect(getComputedStyle(button).backgroundColor).not.toBe(restingFill),
    );
    await userEvent.unhover(button);
  },
};

/** The tinted button for actions that delete or cannot be undone. */
export const LightDestructive: Story = {
  args: {
    color: "light-destructive",
    children: "Next",
    iconTrailing: IconArrowRight,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Next" });
    // Painting the label color gives its red, green and blue parts, whatever
    // color format the browser reports it in.
    const context = document.createElement("canvas").getContext("2d")!;

    context.fillStyle = getComputedStyle(button).color;
    context.fillRect(0, 0, 1, 1);

    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;

    await expect(getComputedStyle(button).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    // The label is red.
    await expect(red).toBeGreaterThan(green);
    await expect(red).toBeGreaterThan(blue);
  },
};

/** The focus ring is only shown when the button is reached with Tab. */
export const FocusRing: Story = {
  render: (args) => (
    <div className="flex gap-3">
      <Button {...args}>First</Button>
      <Button {...args}>Second</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "First" });
    const second = canvas.getByRole("button", { name: "Second" });
    const ring = (button: HTMLElement) =>
      getComputedStyle(button).outlineWidth === "2px";

    // Clicking focuses the button without a ring.
    await userEvent.click(first);
    await expect(first).toHaveFocus();
    await expect(ring(first)).toBe(false);

    // Pressing another key while it is focused does not bring the ring up.
    await userEvent.keyboard("{Enter}");
    await expect(ring(first)).toBe(false);

    // Tab moves on and shows the ring, and Shift+Tab does the same going back.
    await userEvent.tab();
    await expect(second).toHaveFocus();
    await waitFor(() => expect(ring(second)).toBe(true));
    await expect(ring(first)).toBe(false);
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(ring(first)).toBe(true));
    await expect(ring(second)).toBe(false);

    // Focus moved by code, as when a menu closes, shows no ring.
    await userEvent.keyboard("{Escape}");
    second.focus();
    await expect(second).toHaveFocus();
    await expect(ring(second)).toBe(false);
  },
};
