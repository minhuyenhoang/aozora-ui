import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
} from "react-aria-components";
import { cx } from "@/styles/utils";

export const Dialog = (props: AriaDialogProps) => {
  return (
    <AriaDialog
      {...props}
      className={cx(
        // A column that never scrolls itself. The header and footer keep
        // their height, and `DialogBody` takes the rest and scrolls.
        "relative flex max-h-[inherit] w-full flex-col overflow-hidden outline-hidden",
        props.className,
      )}
    />
  );
};
