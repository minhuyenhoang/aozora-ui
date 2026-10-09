import { FixedCropper, ImageRestriction } from "react-advanced-cropper";
import type { FixedCropperProps } from "react-advanced-cropper";
import { Button } from "../../button/Button";
import {
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
import type { FixedCropperRef } from "react-advanced-cropper";
import { FileTrigger } from "react-aria-components";
import {
  autoDownload,
  createDownloadableLink,
  revokeDownloadableLink,
} from "@/utils/file";
import { toast } from "sonner";

interface FixedImageEditorWithUploadProps extends FixedCropperProps {
  containerClassName?: string;
  cropperRef: RefObject<FixedCropperRef | null>;
  filename?: string;
  onUpload?: (file: File) => void;
}

export function ImageEditorFixedCropper({
  src: defaultSrc,
  containerClassName,
  cropperRef,
  filename,
  onUpload,
  ...props
}: FixedImageEditorWithUploadProps) {
  const [src, setSrc] = useState<string | null | undefined>(defaultSrc);

  function onSelect(fileList: FileList | null) {
    const file = fileList?.item(0);

    if (!file) return;

    if (src) revokeDownloadableLink(src);

    setSrc(createDownloadableLink(file));

    onUpload?.(file);
  }

  function download() {
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
    <div
      className={cx("flex flex-col grow thumbnail gap-y-2", containerClassName)}
    >
      <div>
        <FixedCropper
          {...props}
          ref={cropperRef}
          src={src}
          stencilProps={{
            reshandlers: false,
            lines: false,
            movable: true,
            resizable: false,
          }}
          imageRestriction={ImageRestriction.stencil}
          className={cx("rounded-t-md", props.className)}
        />
        <div className="bg-primary rounded-b-md p-1.5 flex items-center justify-center gap-x-2">
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
          <Button
            iconLeading={IconMaximize}
            color="light"
            onClick={() => {
              cropperRef.current?.setCoordinates(({ imageSize }) => imageSize);
            }}
          />
          <Button
            iconLeading={IconDownload}
            color="light"
            isDisabled={!src}
            onClick={download}
          />
        </div>
      </div>
    </div>
  );
}
