import type { RefAttributes } from "react";
import {
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
} from "react-aria-components";
import { TagGroupContext } from "./TagGroupContext";

export interface TagGroupProps
  extends AriaTagGroupProps, RefAttributes<HTMLDivElement> {
  label: string;
  size?: "sm" | "md" | "lg";
}

export interface TagItem {
  id: string;
  label: string;
  count?: number;
  avatarSrc?: string;
  avatarContrastBorder?: boolean;
  dot?: boolean;
  dotClassName?: string;
  isDisabled?: boolean;
  onClose?: (id: string) => void;
}

export function TagGroup({
  label,
  selectionMode = "none",
  size = "sm",
  children,
  ...otherProps
}: TagGroupProps) {
  return (
    <TagGroupContext.Provider value={{ selectionMode, size }}>
      <AriaTagGroup
        aria-label={label}
        selectionMode={selectionMode}
        disallowEmptySelection={selectionMode === "single"}
        {...otherProps}
      >
        {children}
      </AriaTagGroup>
    </TagGroupContext.Provider>
  );
}
