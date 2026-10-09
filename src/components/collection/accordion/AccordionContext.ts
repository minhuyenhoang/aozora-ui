import { createContext } from "react";

export type AccordionSize = "sm" | "md";

export interface AccordionContextValue {
  size: AccordionSize;
}

export const AccordionContext = createContext<AccordionContextValue>({
  size: "md",
});
