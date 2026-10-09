import type { ModalOverlayProps as AriaModalOverlayProps } from "react-aria-components";
import {
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { Dialog } from "./dialog/Dialog";
import { DialogBody } from "./dialog/DialogBody";
import { DialogClose } from "./dialog/DialogClose";
import { DialogDescription } from "./dialog/DialogDescription";
import { DialogFooter } from "./dialog/DialogFooter";
import { DialogHeader } from "./dialog/DialogHeader";
import { DialogTitle } from "./dialog/DialogTitle";

const DialogTrigger = AriaDialogTrigger;
const ModalTrigger = DialogTrigger;
const ModalDialog = Dialog;
const ModalHeader = DialogHeader;
const ModalTitle = DialogTitle;
const ModalDescription = DialogDescription;
const ModalFooter = DialogFooter;
const ModalBody = DialogBody;
const ModalClose = DialogClose;

const ModalOverlay = (props: AriaModalOverlayProps) => {
  return (
    <AriaModalOverlay
      {...props}
      className={(state) =>
        cx(
          "fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center px-4 outline-hidden bg-primary/15 backdrop-blur-[1px] motion-reduce:backdrop-blur-none sm:items-center sm:justify-center sm:px-8",
          // Vertical padding
          "pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]",
          // Animations
          state.isEntering && "duration-300 ease-out animate-in fade-in",
          state.isExiting && "duration-200 ease-in animate-out fade-out",
          typeof props.className === "function"
            ? props.className(state)
            : props.className,
        )
      }
    />
  );
};

const Modal = (props: AriaModalOverlayProps) => (
  <AriaModal
    {...props}
    className={(state) =>
      cx(
        // Clips the dialog to the rounded corners.
        "w-full overflow-hidden rounded-xl bg-primary align-middle shadow-xl outline-hidden sm:rounded-2xl",
        // Max height based on parent's vertical padding
        "max-h-[calc(var(--visual-viewport-height)-var(--modal-pt)-var(--modal-pb))]",
        // Animations
        state.isEntering && "duration-300 ease-out animate-in zoom-in-95",
        state.isExiting && "duration-200 ease-in animate-out zoom-out-95",
        typeof props.className === "function"
          ? props.className(state)
          : props.className,
      )
    }
  />
);

export {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  ModalTrigger,
};
