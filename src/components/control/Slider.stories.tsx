import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Slider } from "./Slider";

const meta = {
  title: "Components/Control/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Volume",
    description: "Adjust the playback volume.",
    size: "sm",
    defaultValue: 40,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "select", options: ["sm", "md"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    hideOutput: { control: "boolean" },
    isDisabled: { control: "boolean" },
    minValue: { control: "number" },
    maxValue: { control: "number" },
    step: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: /Volume/ });

    await expect(slider).toHaveValue("40");
    await expect(canvas.getByRole("status")).toHaveTextContent("40");
    await expect(canvas.getByText("Adjust the playback volume.")).toBeVisible();

    // Arrow keys move the thumb by one step, Home/End jump to the limits.
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(slider).toHaveValue("41");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(slider).toHaveValue("39");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    await expect(slider).toHaveValue("0");
  },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Range: Story = {
  args: {
    label: "Price range",
    description: "Only show products within this range.",
    defaultValue: [20, 80],
    formatOptions: { style: "currency", currency: "USD" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [min, max] = canvas.getAllByRole("slider");

    await expect(min).toHaveValue("20");
    await expect(max).toHaveValue("80");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "$20.00 – $80.00",
    );

    // The lower thumb can't move past the upper one.
    await userEvent.tab();
    await expect(min).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(min).toHaveValue("80");
  },
};

export const Step: Story = {
  args: { step: 10, defaultValue: 50 },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", {
      name: /Volume/,
    });

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(slider).toHaveValue("60");
  },
};

export const HiddenOutput: Story = {
  args: { hideOutput: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("status"),
    ).not.toBeInTheDocument();
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical", description: undefined },
  decorators: [
    (Story) => (
      <div className="flex h-64 justify-center">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", {
      name: /Volume/,
    });

    await expect(slider).toBeDisabled();
    await userEvent.tab();
    await expect(slider).not.toHaveFocus();
  },
};
