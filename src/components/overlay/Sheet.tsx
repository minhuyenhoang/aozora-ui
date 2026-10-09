import type {
  SheetContentProps as AriaSheetContentProps,
  SheetOverlayProps as AriaSheetOverlayProps,
  SheetProps as AriaSheetProps,
  SheetRenderProps as AriaSheetRenderProps,
} from "react-aria-components/Sheet";
import {
  Sheet as AriaSheet,
  SheetBackdrop as AriaSheetBackdrop,
  SheetContent as AriaSheetContent,
  SheetOverlay as AriaSheetOverlay,
  SheetTrigger as AriaSheetTrigger,
} from "react-aria-components/Sheet";
import { cx } from "@styles/utils";
import { DialogBody } from "./dialog/DialogBody";
import { DialogClose } from "./dialog/DialogClose";
import { DialogDescription } from "./dialog/DialogDescription";
import { DialogFooter } from "./dialog/DialogFooter";
import { DialogHeader } from "./dialog/DialogHeader";
import { DialogTitle } from "./dialog/DialogTitle";

const Sheet = AriaSheet;
const SheetTrigger = AriaSheetTrigger;
const SheetHeader = DialogHeader;
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;
const SheetFooter = DialogFooter;
const SheetBody = DialogBody;
const SheetClose = DialogClose;

type SheetPosition = AriaSheetRenderProps["position"];

const styles: Record<
  SheetPosition,
  { root: string; attached: string; floating: string }
> = {
  // `--sheet-stack-*` is how far the sheet moves back when another opens on
  // top of it. `--sheet-gap` is the space kept free above and below it.
  top: {
    root: "w-full max-w-200 [--sheet-stack-y:8px]",
    attached: "rounded-b-2xl",
    floating:
      "rounded-b-2xl mx-2 mt-2 w-[calc(100%-1rem)] [--sheet-gap:--spacing(4)]",
  },
  bottom: {
    root: "w-full max-w-200 [--sheet-stack-y:-8px]",
    attached: "rounded-t-2xl",
    floating:
      "rounded-t-2xl mx-2 mb-2 w-[calc(100%-1rem)] [--sheet-gap:--spacing(4)]",
  },
  left: {
    root: "h-dvh w-3/4 sm:max-w-80 [--sheet-stack-x:8px]",
    attached: "",
    floating: "ml-2",
  },
  right: {
    root: "h-dvh w-3/4 sm:max-w-80 [--sheet-stack-x:-8px]",
    attached: "",
    floating: "mr-2",
  },
  center: {
    root: "w-[calc(100%-2rem)] max-w-lg rounded-2xl [--sheet-gap:--spacing(8)]",
    attached: "",
    floating: "",
  },
};

interface SheetContentProps
  extends
    Omit<AriaSheetOverlayProps, "children" | "className" | "style">,
    Pick<AriaSheetContentProps, "children">,
    Pick<AriaSheetProps, "overscrollPadding"> {
  /**
   * Whether the sheet floats with a gap around it, instead of being attached
   * to the edge of the screen.
   * @default true
   */
  isFloat?: boolean;
  /** Class name for the sheet panel. */
  className?: string;
  /** Props for the overlay that holds the backdrop and the sheet. */
  overlay?: Omit<AriaSheetOverlayProps, "children" | "position">;
}

/**
 * A panel that slides in from an edge of the screen and can be swiped away.
 * Place it in a `SheetTrigger`, and compose its content with `SheetHeader`,
 * `SheetBody`, `SheetFooter` and `SheetClose`.
 */
const SheetContent = ({
  isFloat = true,
  overscrollPadding,
  className,
  overlay,
  children,
  ...props
}: SheetContentProps) => {
  const snapPoints = overlay?.snapPoints ?? props.snapPoints;
  const preventDismissal = overlay?.preventDismissal ?? props.preventDismissal;

  return (
    <AriaSheetOverlay
      {...props}
      {...overlay}
      className={(state) =>
        cx(
          "z-50",
          typeof overlay?.className === "function"
            ? overlay.className(state)
            : overlay?.className,
        )
      }
    >
      <AriaSheetBackdrop
        // The backdrop fades in as the sheet is swiped to its last snap point.
        swipeAnimation="sheet-backdrop"
        swipeAnimationRange={
          snapPoints ? { start: snapPoints.length - 1 } : undefined
        }
        className={(state) =>
          cx(
            // Only the first sheet of a stack dims the page.
            state.stackIndex === 0 &&
              "bg-primary/15 backdrop-blur-[1px] motion-reduce:backdrop-blur-none",
          )
        }
      />
      <AriaSheet
        // The sheet moves back a little when another one opens on top of it.
        stackAnimation="sheet-scale-back"
        // The padding continues the sheet past the edge of the screen, which
        // only makes sense when it is attached to that edge.
        overscrollPadding={isFloat ? false : (overscrollPadding ?? true)}
        className={(state) =>
          cx(
            // `box-content` keeps the size set here when the overscroll
            // padding is added.
            "relative box-content shrink-0 bg-primary shadow-xl ring-1 ring-secondary_alt outline-hidden [--sheet-gap:0px]",
            styles[state.position].root,
            isFloat
              ? styles[state.position].floating
              : styles[state.position].attached,
            className,
          )
        }
      >
        {({ position }) => (
          <>
            {!preventDismissal && position === "bottom" && (
              // A hint that the sheet can be swiped down.
              <div
                aria-hidden="true"
                data-slot="sheet-handle"
                className="pointer-events-none absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-quaternary"
              />
            )}
            <AriaSheetContent
              // A column that never scrolls itself. The header and footer keep
              // their height, and `SheetBody` takes the rest and scrolls.
              className="relative flex max-h-[calc(var(--visual-viewport-height)-var(--sheet-gap))] flex-col overflow-hidden outline-hidden"
            >
              {children}
            </AriaSheetContent>
          </>
        )}
      </AriaSheet>
    </AriaSheetOverlay>
  );
};

export type { SheetContentProps };
export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
