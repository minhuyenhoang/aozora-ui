import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ScrollArea } from "./ScrollArea";

const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);

function getViewport(canvasElement: HTMLElement) {
  return canvasElement.querySelector<HTMLDivElement>(
    "[data-slot=scroll-area-viewport]",
  )!;
}

const meta = {
  title: "Components/Control/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    orientation: "vertical",
    scrollFade: false,
    scrollbarGutter: false,
    className: "h-64 w-72 rounded-lg ring-1 ring-secondary",
    children: (
      <ul className="flex flex-col gap-2 p-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "both"],
    },
    scrollFade: { control: "boolean" },
    scrollbarGutter: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);

    await expect(viewport).toHaveAttribute("data-has-overflow-y");
    await expect(viewport).not.toHaveAttribute("data-has-overflow-x");
    await expect(
      viewport.style.getPropertyValue("--scroll-area-overflow-y-start"),
    ).toBe("0px");

    // Scrolling to the bottom leaves nothing hidden below, and everything above.
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() =>
      expect(
        viewport.style.getPropertyValue("--scroll-area-overflow-y-end"),
      ).toBe("0px"),
    );
    await expect(
      viewport.style.getPropertyValue("--scroll-area-overflow-y-start"),
    ).not.toBe("0px");
  },
};

export const ScrollFade: Story = {
  args: { scrollFade: true },
};

export const ScrollbarGutter: Story = {
  args: { scrollbarGutter: true },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);

    await expect(viewport).toHaveAttribute("data-has-overflow-y");
    await expect(getComputedStyle(viewport).paddingInlineEnd).toBe("10px");
  },
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    scrollFade: true,
    className: "w-72 rounded-lg ring-1 ring-secondary",
    children: (
      <ul className="flex w-max gap-2 p-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md bg-secondary px-3 py-2 text-sm whitespace-nowrap text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);

    await expect(viewport).toHaveAttribute("data-has-overflow-x");
    await expect(viewport).not.toHaveAttribute("data-has-overflow-y");
  },
};

export const Both: Story = {
  args: {
    orientation: "both",
    children: (
      <div className="grid w-max grid-cols-6 gap-2 p-3">
        {Array.from({ length: 60 }, (_, index) => (
          <div
            key={index}
            className="rounded-md bg-secondary px-6 py-4 text-sm whitespace-nowrap text-secondary"
          >
            Cell {index + 1}
          </div>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);

    await expect(viewport).toHaveAttribute("data-has-overflow-y");
    await expect(viewport).toHaveAttribute("data-has-overflow-x");
  },
};

export const NoOverflow: Story = {
  args: {
    scrollFade: true,
    scrollbarGutter: true,
    children: <p className="p-3 text-sm text-secondary">Short content.</p>,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);

    await expect(viewport).not.toHaveAttribute("data-has-overflow-y");
    await expect(getComputedStyle(viewport).paddingInlineEnd).toBe("0px");
  },
};

export const GrowingContent: Story = {
  args: {
    scrollFade: true,
    children: <p className="p-3 text-sm text-secondary">Short content.</p>,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const content = viewport.firstElementChild as HTMLElement;

    await expect(viewport).not.toHaveAttribute("data-has-overflow-y");

    // Content that grows later is picked up without a scroll or a resize.
    content.style.height = "600px";
    await waitFor(() =>
      expect(viewport).toHaveAttribute("data-has-overflow-y"),
    );
    await expect(
      viewport.style.getPropertyValue("--scroll-area-overflow-y-end"),
    ).not.toBe("0px");
  },
};
