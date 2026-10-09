import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconCreditCard, IconLock, IconTruck } from "@tabler/icons-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Accordion } from "./Accordion";
import { AccordionControl } from "./AccordionControl";
import { AccordionItem } from "./AccordionItem";
import { AccordionPanel } from "./AccordionPanel";

const items = [
  {
    id: "shipping",
    title: "How long does shipping take?",
    icon: IconTruck,
    content:
      "Orders are sent within two working days and arrive in three to five.",
  },
  {
    id: "payment",
    title: "Which payment methods do you accept?",
    icon: IconCreditCard,
    content: "We accept all major cards, bank transfer and cash on delivery.",
  },
  {
    id: "privacy",
    title: "How is my data protected?",
    icon: IconLock,
    content: "Your details are encrypted and are never shared with others.",
  },
];

const meta = {
  title: "Components/Collection/Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    size: "md",
    allowsMultipleExpanded: false,
    isDisabled: false,
    onExpandedChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    allowsMultipleExpanded: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(90vw,32rem)]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} id={item.id}>
          <AccordionControl>{item.title}</AccordionControl>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const control = (canvasElement: HTMLElement, name: RegExp) =>
  within(canvasElement).getByRole("button", { name });

const isOpen = (button: HTMLElement) =>
  button.getAttribute("aria-expanded") === "true";

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const shipping = control(canvasElement, /shipping/);
    const payment = control(canvasElement, /payment/);

    // Every item starts closed, with its content hidden.
    await expect(canvas.getAllByRole("button")).toHaveLength(3);
    await expect(isOpen(shipping)).toBe(false);
    await expect(canvas.getByText(/arrive in three to five/)).not.toBeVisible();
    // Each control sits in a heading, so the items can be reached by heading.
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);

    await userEvent.click(shipping);
    await expect(isOpen(shipping)).toBe(true);
    await waitFor(() =>
      expect(canvas.getByText(/arrive in three to five/)).toBeVisible(),
    );
    await expect(args.onExpandedChange).toHaveBeenCalledTimes(1);

    // Opening another item closes the first one.
    await userEvent.click(payment);
    await expect(isOpen(payment)).toBe(true);
    await expect(isOpen(shipping)).toBe(false);

    // Clicking an open item closes it.
    await userEvent.click(payment);
    await expect(isOpen(payment)).toBe(false);
  },
};

/** Several items can be open at once. */
export const MultipleExpanded: Story = {
  args: {
    allowsMultipleExpanded: true,
    defaultExpandedKeys: ["shipping"],
  },
  play: async ({ canvasElement }) => {
    const shipping = control(canvasElement, /shipping/);
    const privacy = control(canvasElement, /data protected/);

    // The item named in `defaultExpandedKeys` starts open.
    await expect(isOpen(shipping)).toBe(true);

    await userEvent.click(privacy);
    await expect(isOpen(privacy)).toBe(true);
    await expect(isOpen(shipping)).toBe(true);
  },
};

export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const shipping = control(canvasElement, /shipping/);

    await expect(getComputedStyle(shipping).fontSize).toBe("14px");
    await userEvent.click(shipping);
    await expect(isOpen(shipping)).toBe(true);
  },
};

/** An icon before each title. */
export const WithIcons: Story = {
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.id} id={item.id}>
          <AccordionControl icon={item.icon}>{item.title}</AccordionControl>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const shipping = control(canvasElement, /shipping/);
    const icon = shipping.querySelector(".tabler-icon-truck")!;
    const chevron = shipping.querySelector(".tabler-icon-chevron-down")!;

    // The icon leads, and the chevron is pushed to the far end.
    await expect(icon).toBeVisible();
    await expect(icon.getBoundingClientRect().left).toBeLessThan(
      chevron.getBoundingClientRect().left,
    );
    await expect(
      Math.round(chevron.getBoundingClientRect().right),
    ).toBe(Math.round(shipping.getBoundingClientRect().right));

    // The chevron turns over while the item is open.
    await expect(getComputedStyle(chevron).rotate).toBe("none");
    await userEvent.click(shipping);
    await waitFor(() =>
      expect(getComputedStyle(chevron).rotate).toBe("180deg"),
    );
  },
};

/** The accordion can be used with the keyboard alone. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const shipping = control(canvasElement, /shipping/);
    const payment = control(canvasElement, /payment/);

    await userEvent.tab();
    await expect(shipping).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(isOpen(shipping)).toBe(true);

    // Tab moves on to the next control, and Space toggles it too.
    await userEvent.tab();
    await expect(payment).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(isOpen(payment)).toBe(true);
    await userEvent.keyboard(" ");
    await expect(isOpen(payment)).toBe(false);
  },
};

/** One item that cannot be opened, among others that can. */
export const DisabledItem: Story = {
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          isDisabled={item.id === "payment"}
        >
          <AccordionControl>{item.title}</AccordionControl>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const shipping = control(canvasElement, /shipping/);
    const payment = control(canvasElement, /payment/);

    await expect(payment).toBeDisabled();
    await expect(shipping).toBeEnabled();

    // Tab skips the disabled item.
    shipping.focus();
    await userEvent.tab();
    await expect(control(canvasElement, /data protected/)).toHaveFocus();
  },
};
