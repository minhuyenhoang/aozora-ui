import type { ReactNode } from "react";
import type { GridListSectionProps as AriaGridListSectionProps } from "react-aria-components";
import {
  Collection as AriaCollection,
  GridListSection as AriaGridListSection,
} from "react-aria-components";
import { cx } from "@styles/utils";
import { GridListHeader } from "./GridListHeader";

export interface GridListSectionProps<
  T extends object = object,
> extends AriaGridListSectionProps<T> {
  /** The heading displayed above the items of the section. */
  title?: ReactNode;
}

/** A group of grid list items with an optional heading. */
export function GridListSection<T extends object = object>({
  title,
  items,
  children,
  className,
  ...props
}: GridListSectionProps<T>) {
  return (
    <AriaGridListSection
      {...props}
      className={cx("flex w-full flex-col gap-1", className)}
    >
      {title && <GridListHeader>{title}</GridListHeader>}
      <AriaCollection items={items}>{children}</AriaCollection>
    </AriaGridListSection>
  );
}
