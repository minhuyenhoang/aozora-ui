import { Time } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TimeField } from "./TimeField";

const meta = {
  title: "Components/Date Time/Time/TimeField",
  component: TimeField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Start time",
    description: "Enter the time the event begins.",
    placeholder: "Select a time",
    defaultValue: new Time(9, 30),
    granularity: "minute",
    hourCycle: 24,
    shouldForceLeadingZeros: true,
    size: "md",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    tooltip: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    granularity: { control: "select", options: ["hour", "minute", "second"] },
    hourCycle: { control: "select", options: [12, 24] },
    shouldForceLeadingZeros: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    isRequired: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const segment = (name: RegExp) => canvas.getByRole("spinbutton", { name });

    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(2);
    await expect(segment(/hour/)).toHaveTextContent("09");
    await expect(segment(/minute/)).toHaveTextContent("30");

    // Arrow keys step the focused part, and typing replaces it.
    await userEvent.click(segment(/hour/));
    await userEvent.keyboard("{ArrowUp}");
    await expect(segment(/hour/)).toHaveTextContent("10");
    await userEvent.keyboard("{ArrowRight}45");
    await expect(segment(/minute/)).toHaveTextContent("45");
  },
};

export const TwelveHour: Story = {
  args: { hourCycle: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const segment = (name: RegExp) => canvas.getByRole("spinbutton", { name });

    // The 12-hour clock adds a part for AM and PM.
    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(3);
    await expect(segment(/AM\/PM/)).toHaveTextContent("AM");

    await userEvent.click(segment(/AM\/PM/));
    await userEvent.keyboard("p");
    await expect(segment(/AM\/PM/)).toHaveTextContent("PM");
    await expect(segment(/hour/)).toHaveTextContent("09");
  },
};

export const WithSeconds: Story = {
  args: { defaultValue: new Time(9, 30, 45), granularity: "second" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(3);
    await expect(
      canvas.getByRole("spinbutton", { name: /second/ }),
    ).toHaveTextContent("45");
  },
};
