import type { Grid } from "@1771technologies/lytenyte-core";
import { IconChevronDown } from "@tabler/icons-react";

export function DataGridRowMasterDetailMarkerCell({
  detailExpanded,
  row,
  api,
}: Grid.T.CellRendererParams) {
  if (api.rowIsGroup(row)) return null;

  return (
    <button
      type="button"
      aria-label={`Toggle details of ${row.id}`}
      aria-expanded={detailExpanded}
      className="text-ln-text flex h-full w-[calc(100%-1px)] cursor-pointer items-center justify-center"
      onClick={() => api.rowDetailToggle(row)}
    >
      <IconChevronDown
        className={`size-4 transform transition-transform duration-300 ${detailExpanded ? "rotate-180" : ""}`}
      />
    </button>
  );
}
