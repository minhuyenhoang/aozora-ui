import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { IconList, IconLayoutGrid } from "@tabler/icons-react";
import { ButtonGroup } from "./ButtonGroup";
import { ButtonGroupItem } from "./ButtonGroupItem";

const meta = {
  title: "Components/Button/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { size: "md", defaultSelectedKeys: ["grid"] },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem id="grid" iconLeading={IconLayoutGrid}>
        Grid
      </ButtonGroupItem>
      <ButtonGroupItem id="list" iconLeading={IconList}>
        List
      </ButtonGroupItem>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("radio", { name: "Grid" });
    const list = canvas.getByRole("radio", { name: "List" });

    await expect(grid).toBeChecked();
    await expect(list).not.toBeChecked();

    // Only one item is selected at a time.
    await userEvent.click(list);
    await expect(list).toBeChecked();
    await expect(grid).not.toBeChecked();
  },
};
