import type { Grid } from "@1771technologies/lytenyte-core";
import { IconChevronDown } from "@tabler/icons-react";

export function DataGridRowGroupMarkerCell({
  row,
  api,
}: Grid.T.CellRendererParams) {
  if (!api.rowIsGroup(row)) return null;

  return (
    <div className="flex h-full items-center gap-2 font-semibold">
      <button
        type="button"
        aria-label={`Toggle ${row.key}`}
        aria-expanded={row.expanded}
        className="text-ln-text flex h-full w-[calc(100%-1px)] cursor-pointer items-center justify-center"
        onClick={() => api.rowGroupToggle(row)}
      >
        <IconChevronDown
          className={`size-4 transform transition-transform duration-300 ${row.expanded ? "rotate-180" : ""}`}
        />
      </button>
      {row.key}
    </div>
  );
}
