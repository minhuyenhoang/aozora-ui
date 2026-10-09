import { createContext, useContext } from "react";

export type TreeSize = "sm" | "md";

export interface TreeContextValue {
  showCheckboxes: boolean;
  showLines: boolean;
  size: TreeSize;
}

export const TreeContext = createContext<TreeContextValue>({
  showCheckboxes: false,
  showLines: false,
  size: "sm",
});

export function useTreeContext() {
  return useContext(TreeContext);
}
