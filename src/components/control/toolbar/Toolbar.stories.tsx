import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCopy,
  IconItalic,
  IconUnderline,
} from "@tabler/icons-react";
import { expect, userEvent, within } from "storybook/test";
import { ToolbarGroup } from "../group/ToolbarGroup";
import { Toolbar } from "./Toolbar";
import { ToolbarItem } from "./ToolbarItem";
import { Separator } from "../../surface/Separator";

const meta = {
  title: "Components/Control/Toolbar",
  component: Toolbar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Text formatting",
    size: "sm",
    orientation: "horizontal",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup aria-label="Style">
        <ToolbarItem isToggle aria-label="Bold" icon={IconBold} />
        <ToolbarItem isToggle aria-label="Italic" icon={IconItalic} />
        <ToolbarItem isToggle aria-label="Underline" icon={IconUnderline} />
      </ToolbarGroup>
      <Separator />
      <ToolbarGroup aria-label="Alignment">
        <ToolbarItem aria-label="Align left" icon={IconAlignLeft} />
        <ToolbarItem aria-label="Align center" icon={IconAlignCenter} />
        <ToolbarItem aria-label="Align right" icon={IconAlignRight} />
      </ToolbarGroup>
      <Separator />
      <ToolbarItem icon={IconCopy}>Copy</ToolbarItem>
      <ToolbarItem isDisabled>Paste</ToolbarItem>
    </Toolbar>
  ),
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole("toolbar", { name: "Text formatting" });

    await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    await expect(canvas.getAllByRole("group")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "Paste" })).toBeDisabled();

    // The separators are thin vertical lines between the groups.
    const separators = canvas.getAllByRole("separator");

    await expect(separators).toHaveLength(2);
    for (const separator of separators) {
      await expect(separator).toHaveAttribute("aria-orientation", "vertical");
      await expect(separator.getBoundingClientRect().width).toBe(1);
      await expect(separator.getBoundingClientRect().height).toBeGreaterThan(
        10,
      );
    }

    // Tab enters the toolbar at its first item.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await expect(toolbar).toContainElement(
      document.activeElement as HTMLElement,
    );
  },
};

export const Medium: Story = {
  args: { size: "md" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });

    // The medium size uses the larger, 20 pixel icon.
    await expect(bold.querySelector("svg")!.getBoundingClientRect().width).toBe(
      20,
    );
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute("aria-pressed", "true");
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const top = (name: string) =>
      canvas.getByRole("button", { name }).getBoundingClientRect().top;

    await expect(canvas.getByRole("toolbar")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );

    // The items are stacked, and the separators run across the toolbar.
    await expect(top("Align left")).toBeGreaterThan(top("Bold"));
    for (const separator of canvas.getAllByRole("separator")) {
      await expect(separator).not.toHaveAttribute(
        "aria-orientation",
        "vertical",
      );
      await expect(separator.getBoundingClientRect().height).toBe(1);
      await expect(separator.getBoundingClientRect().width).toBeGreaterThan(10);
    }

    // The down arrow moves to the next item.
    canvas.getByRole("button", { name: "Bold" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
  },
};

export const KeyboardAndToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });

    await userEvent.click(bold);
    await expect(bold).toHaveAttribute("aria-pressed", "true");

    // Arrow keys move between items, across groups and separators.
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(
      canvas.getByRole("button", { name: "Align left" }),
    ).toHaveFocus();

    // The separator sits across the toolbar's direction.
    await expect(canvas.getAllByRole("separator")[0]).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  },
};
