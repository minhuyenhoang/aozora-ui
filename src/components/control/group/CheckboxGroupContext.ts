import { createContext } from "react";

export interface CheckboxGroupContextType {
  size?: "sm" | "md";
}

export const CheckboxGroupContext =
  createContext<CheckboxGroupContextType | null>(null);
