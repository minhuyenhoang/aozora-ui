import { createContext, useContext } from "react";

export type GridListSize = "sm" | "md";

export interface GridListContextValue {
  showCheckboxes: boolean;
  size: GridListSize;
}

export const GridListContext = createContext<GridListContextValue>({
  showCheckboxes: false,
  size: "sm",
});

export function useGridListContext() {
  return useContext(GridListContext);
}
