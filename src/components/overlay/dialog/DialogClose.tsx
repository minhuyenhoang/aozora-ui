import { IconX } from "@tabler/icons-react";
import { cx } from "@styles/utils";
import { Button, type ButtonProps } from "../../button/Button";

export interface DialogCloseProps extends Omit<ButtonProps, "children"> {
  /** Called when the close button is pressed, as the dialog closes. */
  onClose?: () => void;
}

/**
 * Close button pinned to the top-right corner of the dialog.
 * Closes the surrounding dialog when pressed.
 */
export function DialogClose({
  className,
  onClose,
  onPress,
  ...props
}: DialogCloseProps) {
  return (
    <Button
      slot="close"
      aria-label="Close"
      color="tertiary"
      size="sm"
      iconLeading={IconX}
      data-slot="dialog-close"
      className={cx(
        "absolute top-3 right-3 z-20 sm:top-4 sm:right-4",
        className,
      )}
      {...props}
      onPress={(event) => {
        onPress?.(event);
        onClose?.();
      }}
    />
  );
}
