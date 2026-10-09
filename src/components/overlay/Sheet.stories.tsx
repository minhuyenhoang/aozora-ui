import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../button/Button";
import {
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./Sheet";

const meta = {
  title: "Components/Overlay/Sheet",
  component: SheetContent,
  parameters: { layout: "centered" },
  args: {
    position: "bottom",
    isFloat: true,
    preventDismissal: false,
    children: null,
  },
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["bottom", "top", "left", "right", "center"],
    },
    isFloat: { control: "boolean" },
    preventDismissal: { control: "boolean" },
    children: { control: false },
  },
  render: (args) => (
    <SheetTrigger>
      <Button color="secondary">Open sheet</Button>
      <SheetContent {...args}>
        <SheetClose />
        <SheetHeader>
          <SheetTitle>Share this post</SheetTitle>
          <SheetDescription>
            Choose where the post is shared once it is published.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="gap-3 text-sm text-secondary">
          <p>Share on X</p>
          <p>Share on Medium</p>
          <p>Share on Facebook</p>
        </SheetBody>
        <SheetFooter divider>
          <Button slot="close" color="secondary" size="md">
            Cancel
          </Button>
          <Button slot="close" color="primary" size="md">
            Confirm
          </Button>
        </SheetFooter>
      </SheetContent>
    </SheetTrigger>
  ),
} satisfies Meta<typeof SheetContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens the sheet and waits until it has slid into view. */
async function openSheet(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole("button", { name: "Open sheet" }),
  );

  const dialog = await screen.findByRole("dialog", {
    name: "Share this post",
  });

  // The sheet has come to rest once it stops moving between two checks.
  let previous = "";

  await waitFor(
    async () => {
      const { top, left } = dialog.getBoundingClientRect();
      const current = `${top},${left}`;
      const isMoving = current !== previous;

      previous = current;
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(isMoving).toBe(false);
    },
    // The slide can take a while when the machine is busy.
    { timeout: 5000 },
  );

  return dialog;
}

const closed = () =>
  waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openSheet(canvasElement);
    const box = dialog.getBoundingClientRect();

    // A floating sheet keeps a gap to the edge of the screen, and is centered.
    await expect(window.innerHeight - box.bottom).toBe(8);
    await expect(box.left).toBeGreaterThanOrEqual(8);
    await expect(box.left).toBeCloseTo(window.innerWidth - box.right, 0);
    await expect(box.width).toBeLessThanOrEqual(800);
    // A bottom sheet shows a handle, as it can be swiped down.
    await expect(
      document.querySelector("[data-slot=sheet-handle]"),
    ).toBeInTheDocument();
    await expect(within(dialog).getAllByText(/^Share on/)).toHaveLength(3);

    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await closed();
  },
};

/** Attached to the edge of the screen, with no gap around it. */
export const Attached: Story = {
  args: { isFloat: false },
  play: async ({ canvasElement }) => {
    const dialog = await openSheet(canvasElement);
    const box = dialog.getBoundingClientRect();

    await expect(box.bottom).toBe(window.innerHeight);
    await expect(box.width).toBe(Math.min(800, window.innerWidth));

    await userEvent.keyboard("{Escape}");
    await closed();
  },
};

export const Right: Story = {
  args: { position: "right" },
  play: async ({ canvasElement }) => {
    const dialog = await openSheet(canvasElement);
    const box = dialog.getBoundingClientRect();

    // A side sheet spans the full height of the screen, with a gap beside it.
    await expect(window.innerWidth - box.right).toBe(8);
    await expect(box.top).toBe(0);
    await expect(box.height).toBe(window.innerHeight);
    await expect(box.left).toBeGreaterThan(0);
    await expect(document.querySelector("[data-slot=sheet-handle]")).toBeNull();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Confirm" }),
    );
    await closed();
  },
};

export const Center: Story = {
  args: { position: "center" },
  play: async ({ canvasElement }) => {
    const dialog = await openSheet(canvasElement);
    const box = dialog.getBoundingClientRect();

    await expect(box.left).toBeCloseTo(window.innerWidth - box.right, 0);
    await expect(box.top).toBeCloseTo(window.innerHeight - box.bottom, 0);

    await userEvent.keyboard("{Escape}");
    await closed();
  },
};

/** Escape and swiping do not close it. Only its own buttons do. */
export const PreventDismissal: Story = {
  args: { preventDismissal: true },
  play: async ({ canvasElement }) => {
    const dialog = await openSheet(canvasElement);

    await expect(document.querySelector("[data-slot=sheet-handle]")).toBeNull();

    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(screen.getByRole("dialog")).toBe(dialog);

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await closed();
  },
};
