import { createContext } from "react";

export interface RadioGroupContextType {
  size?: "sm" | "md";
}

export const RadioGroupContext =
  createContext<RadioGroupContextType | null>(null);
