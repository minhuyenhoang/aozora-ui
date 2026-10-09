import { createContext } from "react";

export type ToolbarSize = "sm" | "md";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarContextType {
  size: ToolbarSize;
  orientation: ToolbarOrientation;
}

export const ToolbarContext = createContext<ToolbarContextType>({
  size: "sm",
  orientation: "horizontal",
});
