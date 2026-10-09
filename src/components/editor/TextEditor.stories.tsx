import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TextEditor } from "./TextEditor";

const meta = {
  title: "Components/Editor/TextEditor",
  component: TextEditor,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Description",
    description: "Describe the project in a few sentences.",
    placeholder: "Write something…",
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    placeholder: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(90vw,40rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Description" });

    await expect(
      canvas.getByRole("toolbar", { name: "Formatting" }),
    ).toBeVisible();
    await expect(editor).toHaveTextContent("");
    await expect(
      canvas.getByText("Describe the project in a few sentences."),
    ).toBeVisible();
    // There is nothing to undo yet.
    await expect(canvas.getByRole("button", { name: "Undo" })).toBeDisabled();

    // Clicking the label focuses the editor, like a native field.
    await userEvent.click(canvas.getByText("Description"));
    await waitFor(() => expect(editor).toHaveFocus());
    await userEvent.keyboard("Hello");
    await expect(editor).toHaveTextContent("Hello");
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Undo" })).toBeEnabled(),
    );
  },
};

export const WithContent: Story = {
  args: {
    defaultValue:
      "<h2>Release notes</h2><p>This version adds <strong>pinned columns</strong> and a <em>column settings</em> modal.</p><ul><li>Reorder by dragging</li><li>Hide or show columns</li></ul><blockquote><p>Settings are saved per grid.</p></blockquote>",
  },
  play: async ({ canvasElement }) => {
    const editor = within(canvasElement).getByRole("textbox", {
      name: "Description",
    });
    const content = within(editor);

    // The HTML passed as `defaultValue` is shown as formatted content.
    await expect(
      content.getByRole("heading", { level: 2, name: "Release notes" }),
    ).toBeVisible();
    await expect(content.getByText("pinned columns").tagName).toBe("STRONG");
    await expect(content.getByText("column settings").tagName).toBe("EM");
    await expect(content.getAllByRole("listitem")).toHaveLength(2);
    await expect(editor.querySelector("blockquote")).toHaveTextContent(
      "Settings are saved per grid.",
    );
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, description: "A description is required." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The description is announced as the error message.
    await expect(canvas.getByText("A description is required.")).toHaveAttribute(
      "slot",
      "errorMessage",
    );

    // An invalid editor can still be typed in.
    const editor = canvas.getByRole("textbox", { name: "Description" });

    await userEvent.click(editor);
    await userEvent.keyboard("Fixed");
    await expect(editor).toHaveTextContent("Fixed");
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: "<p>This content is read-only.</p>" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Description" });

    await expect(editor).toHaveAttribute("contenteditable", "false");
    await expect(editor).toHaveTextContent("This content is read-only.");
    for (const name of ["Bold", "Heading 2", "Quote", "Undo", "Image"]) {
      await expect(canvas.getByRole("button", { name })).toBeDisabled();
    }
  },
};

/** A controlled editor, with the HTML it produces shown below. */
export const Controlled: Story = {
  render: function Render(args) {
    const [html, setHtml] = useState("<p>Hello</p>");

    return (
      <div className="flex flex-col gap-3">
        <TextEditor {...args} value={html} onChange={setHtml} />
        <pre
          data-testid="html"
          className="rounded-lg bg-secondary p-3 text-xs whitespace-pre-wrap text-secondary"
        >
          {html}
        </pre>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Description" });
    const output = canvas.getByTestId("html");
    const bold = canvas.getByRole("button", { name: "Bold" });

    await userEvent.click(editor);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.click(bold);
    await waitFor(() =>
      expect(output).toHaveTextContent("<p><strong>Hello</strong></p>"),
    );
    await expect(bold).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Heading 2" }));
    await waitFor(() =>
      expect(output).toHaveTextContent("<h2><strong>Hello</strong></h2>"),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(output).toHaveTextContent("<p><strong>Hello</strong></p>"),
    );
  },
};

export const MaxCharacters: Story = {
  args: { maxCharacters: 20, defaultValue: "<p>Hello</p>" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Description" });

    await expect(canvas.getByText("15 characters left")).toBeVisible();

    await userEvent.click(editor);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.keyboard("Hello world, this is far too long");

    // Typing stops at the limit.
    await expect(canvas.getByText("0 characters left")).toBeVisible();
    await expect(editor).toHaveTextContent("Hello world, this is");

    // Formatting does not use up characters, and deleting frees them.
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.getByText("1 character left")).toBeVisible();
  },
};
