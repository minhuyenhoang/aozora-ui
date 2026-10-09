import type { Ref } from "react";
import {
  Heading as AriaHeading,
  type HeadingProps as AriaHeadingProps,
} from "react-aria-components";
import { cx } from "@styles/utils";

export interface DialogTitleProps extends AriaHeadingProps {
  ref?: Ref<HTMLHeadingElement>;
}

/** The accessible title of the dialog. Labels the dialog for screen readers. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <AriaHeading
      slot="title"
      data-slot="dialog-title"
      className={cx("text-md font-semibold text-primary", className)}
      {...props}
    />
  );
}
