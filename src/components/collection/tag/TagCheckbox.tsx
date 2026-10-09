import { cx } from "@styles/utils";
import { IconCheck } from "@tabler/icons-react";

export interface TagCheckboxProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  isFocused?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export function TagCheckbox({
  className,
  isFocused,
  isSelected,
  isDisabled,
  size = "sm",
}: TagCheckboxProps) {
  return (
    <div
      className={cx(
        "flex cursor-pointer appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset",
        size === "sm" && "size-3.5",
        size === "md" && "size-4",
        size === "lg" && "size-4.5",
        isSelected && "bg-brand-solid ring-brand-solid",
        isDisabled && "cursor-not-allowed opacity-50",
        isDisabled && !isSelected && "bg-tertiary",
        isFocused && "outline-2 outline-offset-2 outline-focus-ring",
        className,
      )}
    >
      <IconCheck
        className={cx(
          "pointer-events-none absolute text-fg-white opacity-0 transition-inherit-all",
          size === "sm" && "size-2.5",
          size === "md" && "size-3",
          size === "lg" && "size-3.5",
          isSelected && "opacity-100",
        )}
      />
    </div>
  );
}
