import type { ReactNode, Ref } from "react";
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { TextField as AriaTextField } from "react-aria-components";
import { DescriptionText } from "../base/DescriptionText";
import { Label } from "../base/Label";
import {
  TextareaBase,
  type TextareaBaseProps,
} from "../base/input/TextareaBase";
import { cx } from "@styles/utils";

export interface TextareaProps extends AriaTextFieldProps {
  /** Label text for the textarea */
  label?: string;
  /** Helper text displayed below the textarea */
  description?: ReactNode;
  /** Tooltip message displayed after the label. */
  tooltip?: string;
  /** Textarea size. */
  size?: TextareaBaseProps["size"];
  /** Class name for the textarea wrapper */
  textAreaClassName?: TextareaBaseProps["className"];
  /** Ref for the textarea wrapper */
  ref?: Ref<HTMLDivElement>;
  /** Ref for the textarea */
  textAreaRef?: TextareaBaseProps["ref"];
  /** Whether to hide required indicator from label. */
  hideRequiredIndicator?: boolean;
  /** Placeholder text. */
  placeholder?: string;
  /** Visible height of textarea in rows. */
  rows?: number;
  /** Visible width of textarea in columns. */
  cols?: number;
}

export function Textarea({
  label,
  description,
  tooltip,
  textAreaRef,
  hideRequiredIndicator,
  textAreaClassName,
  placeholder,
  className,
  rows,
  cols,
  size = "md",
  ...props
}: TextareaProps) {
  return (
    <AriaTextField
      {...props}
      className={(state) =>
        cx(
          "group flex h-max w-full flex-col items-start justify-start gap-1.5",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isInvalid, isRequired }) => (
        <>
          {label && (
            <Label
              isRequired={
                hideRequiredIndicator ? !hideRequiredIndicator : isRequired
              }
              tooltip={tooltip}
            >
              {label}
            </Label>
          )}

          <TextareaBase
            placeholder={placeholder}
            className={textAreaClassName}
            ref={textAreaRef}
            rows={rows}
            cols={cols}
            size={size}
          />

          {description && (
            <DescriptionText isInvalid={isInvalid} size={size}>
              {description}
            </DescriptionText>
          )}
        </>
      )}
    </AriaTextField>
  );
}
