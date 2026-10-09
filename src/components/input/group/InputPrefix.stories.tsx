import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { InputPrefix } from "./InputPrefix";

const meta = {
  title: "Components/Input/InputPrefix",
  component: InputPrefix,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "https://" },
  decorators: [
    (Story) => (
      <div data-input-wrapper data-leading data-input-size="md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputPrefix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const prefix = within(canvasElement).getByText("https://");

    await expect(prefix).toBeVisible();
    // As a leading addon only its left corners are rounded.
    await expect(getComputedStyle(prefix).borderTopLeftRadius).not.toBe("0px");
    await expect(getComputedStyle(prefix).borderTopRightRadius).toBe("0px");
  },
};
