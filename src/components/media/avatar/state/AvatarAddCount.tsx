import { cx } from "@styles/utils";

interface AvatarCountProps {
  count: number;
  className?: string;
}

export function AvatarCount({ count, className }: AvatarCountProps) {
  return (
    <div className={cx("absolute right-0 bottom-0 p-px", className)}>
      <div className="flex size-3.5 items-center justify-center rounded-full bg-fg-destructive-primary text-center text-[10px] leading-[13px] font-bold text-white">
        {count}
      </div>
    </div>
  );
}
