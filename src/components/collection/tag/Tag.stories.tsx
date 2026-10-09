import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Tag, TagList } from "./Tag";
import { TagGroup } from "./group/TagGroup";

const meta = {
  title: "Components/Collection/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    id: "design",
    children: "Design",
  },
  argTypes: {
    children: { control: "text", name: "Label" },
    count: { control: "number" },
    avatarSrc: { control: "text" },
    dot: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  render: (args) => (
    <TagGroup label="Tags" size="md">
      <TagList>
        <Tag {...args} />
      </TagList>
    </TagGroup>
  ),
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tag = canvas.getByRole("row", { name: "Design" });

    await expect(canvas.getByRole("grid", { name: "Tags" })).toBeVisible();
    await expect(tag).toBeVisible();
    // A plain tag has no dot, count or remove button.
    await expect(tag.querySelector("svg")).toBeNull();
    await expect(within(tag).queryByRole("button")).toBeNull();
  },
};

export const WithDot: Story = {
  args: { dot: true },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("row", { name: "Design" });
    const dot = tag.querySelector("svg")!;

    // The dot comes before the label.
    await expect(dot).toBeVisible();
    await expect(dot.nextSibling?.textContent).toBe("Design");
  },
};

export const WithCount: Story = {
  args: { count: 12 },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("row", { name: /Design/ });

    await expect(within(tag).getByText("12")).toBeVisible();
  },
};
