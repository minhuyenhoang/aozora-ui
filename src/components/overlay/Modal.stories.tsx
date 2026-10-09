import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "../button/Button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  ModalTrigger,
} from "./Modal";

const media = (
  <span className="flex size-10 items-center justify-center rounded-lg text-fg-success-primary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset">
    <IconCircleCheck aria-hidden="true" className="size-5" />
  </span>
);

const text = (
  <>
    <ModalTitle>Blog post published</ModalTitle>
    <ModalDescription>
      This blog post has been published. Team members will be able to edit this
      post and republish changes.
    </ModalDescription>
  </>
);

const actions = (
  <>
    <Button slot="close" color="secondary" size="md">
      Cancel
    </Button>
    <Button slot="close" color="primary" size="md">
      Confirm
    </Button>
  </>
);

type StoryArgs = ComponentProps<typeof ModalHeader> & {
  /** Whether the modal is open when the story first renders. */
  defaultOpen?: boolean;
};

const meta = {
  title: "Components/Overlay/Modal",
  component: ModalHeader,
  parameters: { layout: "centered" },
  args: { defaultOpen: true },
  argTypes: {
    defaultOpen: { control: "boolean" },
    alignment: { control: "inline-radio", options: ["left", "center"] },
    divider: { control: "boolean" },
  },
  render: ({ defaultOpen, ...args }) => (
    <ModalTrigger key={String(defaultOpen)} defaultOpen={defaultOpen}>
      <Button color="secondary">Open modal</Button>
      <ModalOverlay isDismissable>
        <Modal className="sm:max-w-100">
          <ModalDialog>
            <ModalClose />
            <ModalHeader {...args} media={media}>
              {text}
            </ModalHeader>
            <ModalFooter>{actions}</ModalFooter>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </ModalTrigger>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StackedLeft: Story = {
  args: { alignment: "left" },
  play: async ({ canvasElement }) => {
    const dialog = await screen.findByRole("dialog", {
      name: "Blog post published",
    });
    const header = dialog.querySelector("[data-slot=dialog-header]")!;
    const title = within(dialog).getByRole("heading", {
      name: "Blog post published",
    });

    await expect(header).toHaveAttribute("data-layout", "stacked");
    await expect(header).toHaveAttribute("data-alignment", "left");
    await expect(getComputedStyle(title).textAlign).not.toBe("center");

    // The close button dismisses the modal.
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // The trigger opens it again.
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open modal" }),
    );
    await expect(await screen.findByRole("dialog")).toBeInTheDocument();
  },
};

export const StackedCenter: Story = {
  args: { alignment: "center" },
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    const header = dialog.querySelector("[data-slot=dialog-header]")!;

    await expect(header).toHaveAttribute("data-alignment", "center");
    await expect(
      getComputedStyle(
        within(dialog).getByRole("heading", { name: "Blog post published" }),
      ).textAlign,
    ).toBe("center");

    // Escape dismisses the modal.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const Horizontal: Story = {
  argTypes: { alignment: { control: false } },
  render: ({ defaultOpen, divider }) => (
    <ModalTrigger key={String(defaultOpen)} defaultOpen={defaultOpen}>
      <Button color="secondary">Open modal</Button>
      <ModalOverlay isDismissable>
        <Modal className="sm:max-w-136">
          <ModalDialog>
            <ModalClose />
            <ModalHeader layout="horizontal" divider={divider} media={media}>
              {text}
            </ModalHeader>
            <ModalFooter
              layout="flex"
              leading={
                <Button slot={null} color="tertiary" size="md">
                  Learn more
                </Button>
              }
            >
              {actions}
            </ModalFooter>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </ModalTrigger>
  ),
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    const footer = dialog.querySelector("[data-slot=dialog-footer]")!;

    await expect(
      dialog.querySelector("[data-slot=dialog-header]"),
    ).toHaveAttribute("data-layout", "horizontal");
    await expect(footer).toHaveAttribute("data-layout", "flex");

    // The leading action is not a close button, so the modal stays open.
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Learn more" }),
    );
    await expect(screen.getByRole("dialog")).toBe(dialog);

    await userEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const WithBody: Story = {
  render: ({ defaultOpen, ...args }) => (
    <ModalTrigger key={String(defaultOpen)} defaultOpen={defaultOpen}>
      <Button color="secondary">Open modal</Button>
      <ModalOverlay isDismissable>
        <Modal className="sm:max-w-100">
          <ModalDialog>
            <ModalClose />
            <ModalHeader {...args} media={media}>
              {text}
            </ModalHeader>
            <ModalBody className="gap-3 text-sm text-secondary">
              <p>Share on X</p>
              <p>Share on Medium</p>
              <p>Share on Facebook</p>
            </ModalBody>
            <ModalFooter divider>{actions}</ModalFooter>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </ModalTrigger>
  ),
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    const body = dialog.querySelector<HTMLElement>("[data-slot=dialog-body]")!;
    const footer = dialog.querySelector("[data-slot=dialog-footer]")!;

    await expect(within(body).getAllByText(/^Share on/)).toHaveLength(3);
    // Short content fits, so the body does not scroll.
    await expect(body.scrollHeight).toBe(body.clientHeight);
    // The footer is divided from the body by a line.
    await expect(getComputedStyle(footer).borderTopWidth).toBe("1px");

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/** Tall content scrolls inside the body. The header and footer stay put. */
export const ScrollingBody: Story = {
  render: ({ defaultOpen, ...args }) => (
    <ModalTrigger key={String(defaultOpen)} defaultOpen={defaultOpen}>
      <Button color="secondary">Open modal</Button>
      <ModalOverlay isDismissable>
        <Modal className="sm:max-w-100">
          <ModalDialog>
            <ModalClose />
            <ModalHeader {...args} media={media}>
              {text}
            </ModalHeader>
            <ModalBody className="gap-3 text-sm text-secondary">
              {Array.from({ length: 60 }, (_, index) => (
                <p key={index}>Line {index + 1} of a long list of content.</p>
              ))}
            </ModalBody>
            <ModalFooter divider>{actions}</ModalFooter>
          </ModalDialog>
        </Modal>
      </ModalOverlay>
    </ModalTrigger>
  ),
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    const body = dialog.querySelector<HTMLElement>("[data-slot=dialog-body]")!;
    const footer = dialog.querySelector("[data-slot=dialog-footer]")!;
    const header = dialog.querySelector("[data-slot=dialog-header]")!;

    // The body has more content than fits, and is what scrolls.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(dialog.scrollHeight).toBe(dialog.clientHeight);

    // Scrolling the body does not move the header or footer.
    const headerTop = header.getBoundingClientRect().top;
    const footerBottom = footer.getBoundingClientRect().bottom;

    body.scrollTop = body.scrollHeight;
    await expect(header.getBoundingClientRect().top).toBe(headerTop);
    await expect(footer.getBoundingClientRect().bottom).toBe(footerBottom);
    await expect(footerBottom).toBeLessThanOrEqual(window.innerHeight);
    await expect(headerTop).toBeGreaterThanOrEqual(0);
  },
};
