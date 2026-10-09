import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Separator } from "../surface/Separator";
import { PinInput } from "./PinInput";

const meta = {
  title: "Components/Input/PinInput",
  component: PinInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { size: "xxs" },
  argTypes: {
    size: {
      control: "select",
      options: ["xxxs", "xxs", "xs", "sm", "md", "lg"],
    },
  },
  render: (args) => (
    <PinInput {...args}>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Group maxLength={4}>
        {Array.from({ length: 4 }, (_, index) => (
          <PinInput.Slot key={index} index={index} />
        ))}
      </PinInput.Group>
      <PinInput.Description>
        Enter the four-digit code sent to your device.
      </PinInput.Description>
    </PinInput>
  ),
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Verification code" });
    const slot = (index: number) =>
      canvas.getByLabelText(`Enter digit ${index} of 4`);

    await expect(
      canvas.getByText("Enter the four-digit code sent to your device."),
    ).toBeVisible();

    // Each typed digit fills the next slot.
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.keyboard("12");
    await expect(slot(1)).toHaveTextContent("1");
    await expect(slot(2)).toHaveTextContent("2");

    await userEvent.keyboard("34");
    await expect(input).toHaveValue("1234");
    await expect(slot(4)).toHaveTextContent("4");

    // Once every slot is filled, typing replaces the last digit.
    await userEvent.keyboard("6");
    await expect(input).toHaveValue("1236");

    await userEvent.keyboard("{Backspace}");
    await expect(input).toHaveValue("123");
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const index of [1, 2, 3, 4]) {
      await expect(
        canvas.getByLabelText(`Enter digit ${index} of 4`),
      ).toHaveAttribute("aria-invalid", "true");
    }
  },
};

/** Two groups of digits divided by a `Separator`. */
export const WithSeparator: Story = {
  render: (args) => (
    <PinInput {...args}>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Group maxLength={6} containerClassName="items-center">
        {[0, 1, 2].map((index) => (
          <PinInput.Slot key={index} index={index} />
        ))}
        <Separator className="h-0.5 w-3 bg-border-primary" />
        {[3, 4, 5].map((index) => (
          <PinInput.Slot key={index} index={index} />
        ))}
      </PinInput.Group>
    </PinInput>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    const slot = (index: number) =>
      canvas.getByLabelText(`Enter digit ${index} of 6`);

    // The separator sits between the third and fourth slots.
    await expect(separator).toBeVisible();
    await expect(
      slot(3).getBoundingClientRect().right,
    ).toBeLessThanOrEqual(separator.getBoundingClientRect().left);
    await expect(
      separator.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(slot(4).getBoundingClientRect().left);

    // Typing carries on across it.
    await userEvent.click(canvas.getByRole("textbox"));
    await userEvent.keyboard("123456");
    await expect(slot(4)).toHaveTextContent("4");
    await expect(slot(6)).toHaveTextContent("6");
  },
};
