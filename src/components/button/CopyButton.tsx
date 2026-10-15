import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useClipboard } from "@hooks/useClipboard";
import {
  UtilityButton,
  type UtilityButtonButtonProps,
} from "./UtilityButton";

export interface CopyButtonProps extends Omit<
  UtilityButtonButtonProps,
  "icon" | "onPress"
> {
  /** The text copied to the clipboard when the button is pressed */
  text: string;
}

export function CopyButton({
  text,
  color = "tertiary",
  tooltip = "Copy",
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <UtilityButton
      {...props}
      color={color}
      // Also the accessible name, so it announces the copied state.
      tooltip={copied ? "Copied" : tooltip}
      icon={
        copied ? (
          <IconCheck data-icon className="text-success-primary!" />
        ) : (
          IconCopy
        )
      }
      onPress={() => copy(text)}
    />
  );
}
