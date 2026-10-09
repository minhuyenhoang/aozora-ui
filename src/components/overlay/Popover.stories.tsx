import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
} from "react-aria-components";
import { Popover } from "./Popover";
import { OverlayTrigger } from "./OverlayTrigger";

const meta = {
  title: "Components/Overlay/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { size: "md" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  render: (args) => (
    <AriaDialogTrigger defaultOpen>
      <OverlayTrigger className="rounded-lg bg-brand-solid px-3 py-2 text-sm font-semibold text-white">
        Open popover
      </OverlayTrigger>
      <Popover {...args}>
        <AriaDialog className="p-4 text-sm text-primary outline-hidden">
          Popover content
        </AriaDialog>
      </Popover>
    </AriaDialogTrigger>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Open popover",
      hidden: true,
    });
    const dialog = await screen.findByRole("dialog");

    await expect(dialog).toHaveTextContent("Popover content");
    // The popover opens below its trigger.
    await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().bottom,
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Opened from its trigger, Escape gives focus back to the trigger.
    await userEvent.click(trigger);
    // It fades in, so it is not visible at once.
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
