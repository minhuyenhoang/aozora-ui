import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tag, TagList } from "../Tag";
import { TagGroup } from "./TagGroup";

const meta = {
  title: "Components/Collection/TagGroup",
  component: TagGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Project tags",
    size: "md",
    selectionMode: "multiple",
    defaultSelectedKeys: ["design"],
    children: null,
  },
  argTypes: {
    label: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    selectionMode: {
      control: "select",
      options: ["none", "single", "multiple"],
    },
  },
  render: (args) => (
    <TagGroup {...args}>
      <TagList className="flex flex-wrap gap-1.5 outline-hidden">
        <Tag id="design" dot>
          Design
        </Tag>
        <Tag id="engineering" count={8}>
          Engineering
        </Tag>
        <Tag id="marketing">Marketing</Tag>
      </TagList>
    </TagGroup>
  ),
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tag = (name: RegExp) => canvas.getByRole("row", { name });

    await expect(
      canvas.getByRole("grid", { name: "Project tags" }),
    ).toHaveAttribute("aria-multiselectable", "true");
    await expect(tag(/Design/)).toHaveAttribute("aria-selected", "true");
    await expect(tag(/Engineering/)).toHaveAttribute("aria-selected", "false");

    // Selecting another tag keeps the first one selected.
    await userEvent.click(tag(/Engineering/));
    await expect(tag(/Engineering/)).toHaveAttribute("aria-selected", "true");
    await expect(tag(/Design/)).toHaveAttribute("aria-selected", "true");

    // Arrow keys move between tags, and Space toggles the focused one.
    await userEvent.keyboard("{ArrowRight}");
    await expect(tag(/Marketing/)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(tag(/Marketing/)).toHaveAttribute("aria-selected", "true");
  },
};

export const SingleSelection: Story = {
  args: {
    selectionMode: "single",
    defaultSelectedKeys: ["engineering"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tag = (name: RegExp) => canvas.getByRole("row", { name });

    await expect(tag(/Engineering/)).toHaveAttribute("aria-selected", "true");
    await expect(tag(/Design/)).toHaveAttribute("aria-selected", "false");

    // Selecting another tag replaces the selection.
    await userEvent.click(tag(/Marketing/));
    await expect(tag(/Marketing/)).toHaveAttribute("aria-selected", "true");
    await expect(tag(/Engineering/)).toHaveAttribute("aria-selected", "false");
  },
};
