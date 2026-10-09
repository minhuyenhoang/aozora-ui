import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { InputFile } from "./InputFile";

const meta = {
  title: "Components/Input/InputFile",
  component: InputFile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Upload document",
    description: "PDF, PNG, or JPG files up to 10 MB.",
    placeholder: "Choose a file",
    buttonText: "Upload",
    size: "md",
    acceptedFileTypes: [".pdf", ".png", ".jpg", ".jpeg"],
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
    buttonText: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
    isLoading: { control: "boolean" },
    allowsMultiple: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByPlaceholderText("Choose a file");
    const fileInput =
      canvasElement.querySelector<HTMLInputElement>("input[type=file]")!;

    await expect(canvas.getByRole("button", { name: "Upload" })).toBeVisible();
    await expect(fileInput).toHaveAttribute("accept", ".pdf,.png,.jpg,.jpeg");
    await expect(field).toHaveValue("");

    // The name of the chosen file is shown in the field.
    await userEvent.upload(
      fileInput,
      new File(["report"], "report.pdf", { type: "application/pdf" }),
    );
    await expect(field).toHaveValue("report.pdf");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};
