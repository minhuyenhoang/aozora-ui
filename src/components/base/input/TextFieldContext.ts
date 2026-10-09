import { createContext, useContext } from "react";
import type { InputBaseProps } from "./InputBase";

export type TextFieldContextProps = Partial<
  Pick<
    InputBaseProps,
    | "size"
    | "wrapperClassName"
    | "inputClassName"
    | "iconClassName"
    | "tooltipClassName"
  >
>;

export const TextFieldContext = createContext<TextFieldContextProps>({});

export function useTextFieldContext() {
  return useContext(TextFieldContext);
}
