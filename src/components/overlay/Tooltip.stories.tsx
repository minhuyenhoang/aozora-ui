import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { OverlayTrigger } from "./OverlayTrigger";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Components/Overlay/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    title: "Helpful information",
    description: "A short description that gives the user more context.",
    arrow: true,
    delay: 0,
    children: (
      <OverlayTrigger className="rounded-lg bg-brand-solid px-3 py-2 text-sm font-semibold text-white">
        Hover or focus me
      </OverlayTrigger>
    ),
  },
  argTypes: {
    description: { control: "text" },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Hover or focus me",
    });

    await expect(screen.queryByRole("tooltip")).toBeNull();

    // Focusing the trigger with the keyboard shows the tooltip.
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    const tooltip = await screen.findByRole("tooltip");

    await expect(tooltip).toHaveTextContent("Helpful information");
    await expect(tooltip).toHaveTextContent(
      "A short description that gives the user more context.",
    );
    await expect(trigger).toHaveAccessibleDescription(/Helpful information/);

    // Escape hides it without moving focus.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
