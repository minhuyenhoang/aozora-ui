import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { FixedCropperRef } from "react-advanced-cropper";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ImageEditorFixedCropper } from "./ImageEditorFixedCropper";

/** A small landscape picture, kept inline so the story needs no network. */
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23bae6fd'/%3E%3Ccircle cx='500' cy='110' r='50' fill='%23fde047'/%3E%3Cpath d='M0 400 L200 170 L330 310 L440 220 L640 400 Z' fill='%230369a1'/%3E%3C/svg%3E";

type StoryArgs = Omit<
  Parameters<typeof ImageEditorFixedCropper>[0],
  "cropperRef"
>;

/** Owns the ref the cropper needs, and shows how the image was transformed. */
function Example(args: StoryArgs) {
  const cropperRef = useRef<FixedCropperRef>(null);
  const [transforms, setTransforms] = useState("loading");

  function showTransforms(cropper: FixedCropperRef) {
    const { rotate, flip } = cropper.getTransforms();

    setTransforms(
      `rotate ${rotate}, flip ${flip.horizontal ? "horizontal" : "none"}/${flip.vertical ? "vertical" : "none"}`,
    );
  }

  return (
    <div className="flex w-[min(92vw,36rem)] flex-col gap-2">
      <ImageEditorFixedCropper
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
  title: "Components/Editor/ImageEditorFixedCropper",
  parameters: { layout: "centered" },
  args: {
    src: image,
    filename: "photo",
    // The crop frame keeps this size. The image moves and zooms behind it.
    stencilSize: { width: 240, height: 240 },
    onUpload: fn(),
  },
  argTypes: {
    src: { control: "text" },
    filename: { control: "text" },
    stencilSize: { control: "object" },
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
    await ready(canvasElement);

    // The crop frame is always shown, so there is no button to start editing.
    await expect(
      within(canvasElement).queryByRole("button", { name: "Edit" }),
    ).toBeNull();
    for (const icon of ["zoom-in", "maximize", "download"]) {
      await expect(iconButton(canvasElement, icon)).toBeEnabled();
    }
  },
};

/** A parent that never re-renders, as when the cropper is used on its own. */
function StaticExample(args: StoryArgs) {
  const cropperRef = useRef<FixedCropperRef>(null);

  return (
    <div className="w-[min(92vw,36rem)]">
      <ImageEditorFixedCropper
        {...args}
        cropperRef={cropperRef}
        className="h-80 bg-secondary"
      />
    </div>
  );
}

/** The buttons work as soon as there is an image, with no help from the parent. */
export const WithoutCallbacks: Story = {
  render: (args) => <StaticExample {...args} />,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("img")).toBeInTheDocument(),
    );
    for (const icon of [
      "zoom-in",
      "zoom-out",
      "rotate",
      "rotate-clockwise",
      "flip-vertical",
      "flip-horizontal",
      "download",
    ]) {
      await expect(iconButton(canvasElement, icon)).toBeEnabled();
    }
  },
};

/** A wide crop frame, for example for a cover picture. */
export const WideStencil: Story = {
  args: { stencilSize: { width: 400, height: 160 } },
  play: async ({ canvasElement }) => {
    await ready(canvasElement);

    const stencil = canvasElement
      .querySelector(".advanced-cropper-rectangle-stencil")!
      .getBoundingClientRect();

    await expect(Math.round(stencil.width)).toBe(400);
    await expect(Math.round(stencil.height)).toBe(160);
  },
};

/** Without an image only the upload button does anything. */
export const Empty: Story = {
  args: { src: undefined },
  play: async ({ canvasElement }) => {
    await expect(iconButton(canvasElement, "upload")).toBeEnabled();
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

export const Upload: Story = {
  args: { src: undefined },
  play: async ({ args, canvasElement }) => {
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
    await expect(iconButton(canvasElement, "download")).toBeEnabled();
  },
};

/** Downloads the part of the image inside the frame, under `filename`. */
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
