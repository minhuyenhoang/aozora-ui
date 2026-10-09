import { Time } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { TimePicker } from "./TimePicker";

const meta = {
  title: "Components/Date Time/Time/TimePicker",
  component: TimePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Start time",
    description: "Click a segment to choose its value.",
    placeholder: "Select a time",
    defaultValue: new Time(13, 45, 30),
    granularity: "second",
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
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const segment = (name: RegExp) => canvas.getByRole("spinbutton", { name });

    await expect(segment(/hour/)).toHaveTextContent("13");

    // Clicking a part opens a list of values for every part.
    await userEvent.click(segment(/hour/));

    const options = await screen.findByRole("group", { name: "Time options" });
    const list = (name: string) =>
      within(within(options).getByRole("listbox", { name }));

    await expect(within(options).getAllByRole("listbox")).toHaveLength(3);
    await expect(
      list("Hours").getByRole("option", { name: "13" }),
    ).toHaveAttribute("aria-selected", "true");

    // Choosing a value updates the field and keeps the list open.
    await userEvent.click(list("Hours").getByRole("option", { name: "08" }));
    await expect(segment(/hour/)).toHaveTextContent("08");
    await userEvent.click(list("Seconds").getByRole("option", { name: "05" }));
    await expect(segment(/second/)).toHaveTextContent("05");
    await expect(segment(/minute/)).toHaveTextContent("45");

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("group", { name: "Time options" })).toBeNull(),
    );
  },
};

export const MinutesOnly: Story = {
  args: { defaultValue: new Time(13, 45), granularity: "minute" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("spinbutton", { name: /minute/ }));

    const options = await screen.findByRole("group", { name: "Time options" });

    // There is no list for seconds.
    await expect(within(options).getAllByRole("listbox")).toHaveLength(2);
    await expect(
      within(options).queryByRole("listbox", { name: "Seconds" }),
    ).toBeNull();
  },
};

export const Empty: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hour = canvas.getByRole("spinbutton", { name: /hour/ });

    await expect(hour).toHaveAttribute("aria-valuetext", "Empty");
    await userEvent.click(hour);

    const options = await screen.findByRole("group", { name: "Time options" });

    // Nothing is selected until a value is chosen.
    await expect(
      options.querySelectorAll("[role=option][aria-selected=true]"),
    ).toHaveLength(0);
    await userEvent.click(
      within(within(options).getByRole("listbox", { name: "Hours" })).getByRole(
        "option",
        { name: "07" },
      ),
    );
    await expect(hour).toHaveTextContent("07");
  },
};
