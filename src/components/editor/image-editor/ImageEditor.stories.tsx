import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CropperRef } from "react-advanced-cropper";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ImageEditor } from "./ImageEditor";

/** A small landscape picture, kept inline so the story needs no network. */
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23bae6fd'/%3E%3Ccircle cx='500' cy='110' r='50' fill='%23fde047'/%3E%3Cpath d='M0 400 L200 170 L330 310 L440 220 L640 400 Z' fill='%230369a1'/%3E%3C/svg%3E";

type StoryArgs = Omit<Parameters<typeof ImageEditor>[0], "cropperRef">;

/** Owns the ref the cropper needs, and shows how the image was transformed. */
function Example(args: StoryArgs) {
  const cropperRef = useRef<CropperRef>(null);
  const [transforms, setTransforms] = useState("loading");

  function showTransforms(cropper: CropperRef) {
    const { rotate, flip } = cropper.getTransforms();

    setTransforms(
      `rotate ${rotate}, flip ${flip.horizontal ? "horizontal" : "none"}/${flip.vertical ? "vertical" : "none"}`,
    );
  }

  return (
    <div className="flex w-[min(92vw,36rem)] flex-col gap-2">
      <ImageEditor
        {...args}
        cropperRef={cropperRef}
        className="h-80 bg-secondary"
        onReady={showTransforms}
        onChange={showTransforms}
      />
      <output data-testid="transforms" className="text-xs text-tertiary">
        {transforms}
      </output>
    </div>
  );
}

const meta = {
  title: "Components/Editor/ImageEditor",
  parameters: { layout: "centered" },
  args: {
    src: image,
    filename: "photo",
    onUpload: fn(),
  },
  argTypes: {
    src: { control: "text" },
    filename: { control: "text" },
    labels: { control: "object" },
  },
  // Remount when a control changes, since the image is only read once.
  render: (args) => <Example key={JSON.stringify(args)} {...args} />,
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Finds a toolbar button by its icon, as the buttons have no text. */
const iconButton = (canvasElement: HTMLElement, icon: string) =>
  canvasElement.querySelector(`.tabler-icon-${icon}`)!.closest("button")!;

/** Waits until the image has loaded into the cropper. */
const ready = (canvasElement: HTMLElement) =>
  waitFor(() =>
    expect(within(canvasElement).getByTestId("transforms")).toHaveTextContent(
      "rotate 0",
    ),
  );

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await ready(canvasElement);

    // The crop frame is hidden until editing starts.
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeEnabled();
    await expect(iconButton(canvasElement, "zoom-in")).toBeEnabled();
    await expect(
      canvasElement.querySelector(".tabler-icon-maximize"),
    ).toBeNull();
  },
};

/** Without an image only the upload button can be used. */
export const Empty: Story = {
  args: { src: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(iconButton(canvasElement, "upload")).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeDisabled();
    for (const icon of [
      "zoom-in",
      "zoom-out",
      "rotate",
      "rotate-clockwise",
      "flip-vertical",
      "flip-horizontal",
      "download",
    ]) {
      await expect(iconButton(canvasElement, icon)).toBeDisabled();
    }
  },
};

export const RotateAndFlip: Story = {
  play: async ({ canvasElement }) => {
    const transforms = within(canvasElement).getByTestId("transforms");

    await ready(canvasElement);

    await userEvent.click(iconButton(canvasElement, "rotate-clockwise"));
    await waitFor(() => expect(transforms).toHaveTextContent("rotate 90"));

    // Rotating the other way brings the image back.
    await userEvent.click(iconButton(canvasElement, "rotate"));
    await waitFor(() => expect(transforms).toHaveTextContent("rotate 0"));

    await userEvent.click(iconButton(canvasElement, "flip-horizontal"));
    await waitFor(() =>
      expect(transforms).toHaveTextContent("flip horizontal/none"),
    );
    await userEvent.click(iconButton(canvasElement, "flip-vertical"));
    await waitFor(() =>
      expect(transforms).toHaveTextContent("flip horizontal/vertical"),
    );
  },
};

/** Editing shows the crop frame, and a button that fits it to the image. */
export const Cropping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await ready(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));

    // The same button now cancels, and the fit button is shown.
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(iconButton(canvasElement, "maximize")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(
      canvasElement.querySelector(".tabler-icon-maximize"),
    ).toBeNull();
  },
};

/** `labels` replaces the text of the buttons, for example to translate it. */
export const CustomLabels: Story = {
  args: { labels: { edit: "Crop", cancel: "Stop cropping" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await ready(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Crop" }));
    await expect(
      canvas.getByRole("button", { name: "Stop cropping" }),
    ).toBeVisible();
  },
};

export const Upload: Story = {
  args: { src: undefined },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const file = new File(
      [decodeURIComponent(image.slice(image.indexOf(",") + 1))],
      "picture.svg",
      { type: "image/svg+xml" },
    );

    await userEvent.upload(
      canvasElement.querySelector<HTMLInputElement>("input[type=file]")!,
      file,
    );
    await expect(args.onUpload).toHaveBeenCalledWith(file);

    // The uploaded picture is loaded, which turns the other buttons on.
    await ready(canvasElement);
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeEnabled();
    await expect(iconButton(canvasElement, "download")).toBeEnabled();
  },
};

/** Downloads the image as it is shown, under the given `filename`. */
export const Download: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    await userEvent.click(iconButton(canvasElement, "download"));

    // The download goes through a temporary link named after the file.
    await waitFor(() =>
      expect(document.querySelector("a[download=photo]")).toBeInTheDocument(),
    );
  },
};
