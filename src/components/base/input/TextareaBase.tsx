import type { Ref } from "react";
import type { TextAreaProps as AriaTextareaProps } from "react-aria-components";
import { TextArea as AriaTextarea } from "react-aria-components";
import { cx } from "@styles/utils";

// Creates a data URL for an SVG resize handle with a given color.
function getResizeHandleBg(color: string) {
  return `url(data:image/svg+xml;base64,${btoa(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L2 10" stroke="${color}" stroke-linecap="round"/><path d="M11 7L7 11" stroke="${color}" stroke-linecap="round"/></svg>`)})`;
}

export interface TextareaBaseProps extends AriaTextareaProps {
  ref?: Ref<HTMLTextAreaElement>;
  size?: "sm" | "md";
}

export function TextareaBase({
  className,
  size = "md",
  ...props
}: TextareaBaseProps) {
  return (
    <AriaTextarea
      {...props}
      style={
        {
          "--resize-handle-bg": getResizeHandleBg("#D5D7DA"),
          "--resize-handle-bg-dark": getResizeHandleBg("#373A41"),
        } as React.CSSProperties
      }
      className={(state) =>
        cx(
          "w-full scroll-py-3 rounded-lg bg-primary text-primary shadow-xs ring-1 ring-primary transition duration-100 ease-linear ring-inset placeholder:text-placeholder autofill:rounded-lg autofill:text-primary focus:outline-hidden",

          size === "sm" && "p-3 text-sm",
          size === "md" && "px-3.5 py-3 text-md",

          // Resize handle
          "[&::-webkit-resizer]:bg-(image:--resize-handle-bg) [&::-webkit-resizer]:bg-contain dark:[&::-webkit-resizer]:bg-(image:--resize-handle-bg-dark)",

          state.isFocused && !state.isDisabled && "ring-2 ring-brand",
          state.isDisabled && "cursor-not-allowed opacity-50",
          state.isInvalid && "ring-destructive_subtle",
          state.isInvalid && state.isFocused && "ring-2 ring-destructive",

          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
