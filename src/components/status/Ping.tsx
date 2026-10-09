import { cx } from "@/styles/utils";

interface PingProps {
  /** The classes for container component */
  containerClassName?: string;
  /** The classes for static/still component */
  innerClassName?: string;
  /** The classes for ping animated component */
  outerClassName?: string;
}

export function Ping({
  containerClassName,
  innerClassName,
  outerClassName,
}: PingProps) {
  return (
    <div className={cx("relative flex size-2.5", containerClassName)}>
      <span
        className={cx(
          "absolute inline-flex h-full w-full animate-ping rounded-full bg-fg-brand-primary opacity-75",
          outerClassName,
        )}
      ></span>
      <span
        className={cx(
          "relative inline-flex size-2.5 rounded-full bg-fg-brand-primary",
          innerClassName,
        )}
      ></span>
    </div>
  );
}
