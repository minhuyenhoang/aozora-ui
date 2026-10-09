import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { IconLayoutGrid } from "@tabler/icons-react";
import { ButtonGroup } from "./ButtonGroup";
import { ButtonGroupItem } from "./ButtonGroupItem";

const meta = {
  title: "Components/Button/ButtonGroupItem",
  component: ButtonGroupItem,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    id: "grid",
    children: "Grid",
    iconLeading: IconLayoutGrid,
  },
  render: (args) => (
    <ButtonGroup defaultSelectedKeys={["grid"]}>
      <ButtonGroupItem {...args} />
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroupItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("radio", { name: "Grid" });

    await expect(item).toBeChecked();
    await expect(item).toHaveAttribute("data-icon-leading", "true");
    await expect(item.querySelector("svg")).toBeVisible();
  },
};
