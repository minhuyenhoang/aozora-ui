import { Cropper, ImageRestriction } from "react-advanced-cropper";
import type { CropperProps, CropperRef } from "react-advanced-cropper";
import { Button } from "../../button/Button";
import {
  IconCrop,
  IconDownload,
  IconFlipHorizontal,
  IconFlipVertical,
  IconMaximize,
  IconRotate,
  IconRotateClockwise,
  IconUpload,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { cx } from "@/styles/utils";
import { useState, type RefObject } from "react";
import { toast } from "sonner";
import {
  autoDownload,
  createDownloadableLink,
  revokeDownloadableLink,
} from "@utils/file";
import { FileTrigger } from "react-aria-components";

export interface ImageEditorLabels {
  /** The button that starts cropping. */
  edit: string;
  /** The button that stops cropping. */
  cancel: string;
}

const DEFAULT_LABELS: ImageEditorLabels = {
  edit: "Edit",
  cancel: "Cancel",
};

interface ImageEditorProps extends CropperProps {
  containerClassName?: string;
  cropperRef: RefObject<CropperRef | null>;
  filename?: string;
  onUpload?: (file: File) => void;
  /** Overrides the text of the buttons, for example to translate them. */
  labels?: Partial<ImageEditorLabels>;
}

export function ImageEditor({
  src: defaultSrc,
  containerClassName,
  cropperRef,
  stencilProps,
  filename,
  onUpload,
  labels,
  ...props
}: ImageEditorProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const [src, setSrc] = useState<string | null | undefined>(defaultSrc);
  const [enableCropper, setEnableCropper] = useState<boolean>(false);

  function onSelect(fileList: FileList | null) {
    const file = fileList?.item(0);

    if (!file) return;

    if (src) revokeDownloadableLink(src);

    setSrc(createDownloadableLink(file));

    onUpload?.(file);
  }

  function download() {
    if (!enableCropper) {
      cropperRef.current?.setCoordinates(({ imageSize }) => imageSize);
    }

    cropperRef.current?.getCanvas()?.toBlob((blob) => {
      if (!blob) {
        toast.error("Cannot crop!");
        return;
      }

      const link = URL.createObjectURL(blob);

      if (!link) return;

      autoDownload(link, filename ?? "image");
    });
  }

  return (
    <div className={cx("flex flex-col gap-y-2", containerClassName)}>
      <Cropper
        {...props}
        ref={cropperRef}
        src={src}
        stencilProps={{
          ...stencilProps,
          className: enableCropper ? "" : "hidden",
          reshandlers: false,
          lines: false,
          movable: true,
          resizable: true,
        }}
        imageRestriction={ImageRestriction.stencil}
        className={cx("rounded-t-md", props.className)}
      />

      <div className="bg-primary rounded-b-md p-1.5 flex justify-center items-center gap-x-2">
        <FileTrigger acceptedFileTypes={["image/*"]} onSelect={onSelect}>
          <Button iconLeading={IconUpload} color="light" />
        </FileTrigger>
        <Button
          iconLeading={IconZoomIn}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.zoomImage(1.1);
            }
          }}
        />
        <Button
          iconLeading={IconZoomOut}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.zoomImage(0.9);
            }
          }}
        />
        <Button
          iconLeading={IconRotate}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.rotateImage(-90);
            }
          }}
        />
        <Button
          iconLeading={IconRotateClockwise}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.rotateImage(90);
            }
          }}
        />
        <Button
          iconLeading={IconFlipVertical}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.flipImage(false, true);
            }
          }}
        />
        <Button
          iconLeading={IconFlipHorizontal}
          color="light"
          isDisabled={!src}
          onClick={() => {
            if (cropperRef.current) {
              cropperRef.current.flipImage(true, false);
            }
          }}
        />
        {enableCropper && (
          <>
            <Button
              iconLeading={IconMaximize}
              color="light"
              onClick={() => {
                cropperRef.current?.setCoordinates(
                  ({ imageSize }) => imageSize,
                );
              }}
            />
          </>
        )}
        <Button
          iconLeading={IconDownload}
          color="light"
          isDisabled={!src}
          onClick={() => {
            download();
            setEnableCropper(false);
          }}
        />
        <Button
          color={enableCropper ? "secondary" : "primary"}
          iconLeading={enableCropper ? undefined : IconCrop}
          isDisabled={!src}
          onClick={() => {
            setEnableCropper((prev) => !prev);
          }}
        >
          {enableCropper ? resolvedLabels.cancel : resolvedLabels.edit}
        </Button>
      </div>
    </div>
  );
}
