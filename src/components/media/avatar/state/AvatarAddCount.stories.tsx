import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Avatar } from "../Avatar";
import { AvatarCount } from "./AvatarAddCount";

const meta = {
  title: "Components/Avatar/AvatarCount",
  component: AvatarCount,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { count: 3 },
  render: (args) => (
    <div className="relative inline-flex">
      <Avatar size="lg" initials="AS" alt="Alex Smith" />
      <AvatarCount {...args} />
    </div>
  ),
} satisfies Meta<typeof AvatarCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const count = canvas.getByText("3");
    const avatar = canvasElement.querySelector("[data-avatar]")!;

    await expect(count).toBeVisible();
    // The count sits on the bottom right corner of the avatar.
    await expect(
      Math.abs(
        count.getBoundingClientRect().right -
          avatar.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(2);
  },
};
