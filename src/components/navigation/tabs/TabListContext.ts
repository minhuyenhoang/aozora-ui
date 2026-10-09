import { createContext } from "react";

export type TabOrientation = "horizontal" | "vertical";

export type TabSize = "sm" | "md";

// Types for different orientations
export type HorizontalTabTypes =
  | "button-brand"
  | "button-gray"
  | "button-border"
  | "button-minimal"
  | "underline";
export type VerticalTabTypes =
  "button-brand" | "button-gray" | "button-border" | "button-minimal" | "line";
export type TabTypeColors<T> = T extends "horizontal"
  ? HorizontalTabTypes
  : VerticalTabTypes;

export interface TabListContextValue {
  size?: TabSize;
  type?: HorizontalTabTypes | VerticalTabTypes;
  orientation?: TabOrientation;
  fullWidth?: boolean;
}

export const TabListContext = createContext<TabListContextValue>({
  size: "sm",
  type: "button-brand",
});
