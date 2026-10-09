import { Grid } from "@1771technologies/lytenyte-core";
import { DataGridEmptyDataOverlay } from "./overlay/DataGridEmptyDataOverlay";
import { DataGridLoadingOverlay } from "./overlay/DataGridLoadingOverlay";
import { DATA_GRID_COLUMN_ANIMATE, DATA_GRID_ROW_ANIMATE } from "./constants";

export interface DataGridProps extends Grid.Props {
  isLoading?: boolean;
}

export function DataGrid({
  rowSource,
  columnBase,
  isLoading = false,
  rowHeight,
  ...props
}: DataGridProps) {
  const rowCount = rowSource?.useRowCount();

  return (
    <Grid
      {...props}
      rowSource={rowSource}
      rowHeight={rowHeight ? rowHeight : 35}
      headerHeight={30}
      columnBase={columnBase}
      rowAnimate={DATA_GRID_ROW_ANIMATE}
      columnAnimate={DATA_GRID_COLUMN_ANIMATE}
      suppressScrollFlash
      slotViewportOverlay={isLoading ? DataGridLoadingOverlay : null}
      slotRowsOverlay={
        !rowCount && !isLoading ? DataGridEmptyDataOverlay : null
      }
      styles={{
        viewport: {
          style: {
            outline: "none",
          },
        },
        headerGroup: {
          // Sticky group headers: `position: sticky`, offset by the width of
          // the columns pinned to the start, with overflow left visible.
          // Applied only to unpinned groups. A pinned group's header is
          // already placed by the grid, and this offset would push it out
          // from above its own columns.
          className:
            "data-[ln-colpin=center]:sticky! data-[ln-colpin=center]:start-(--ln-start-offset)! data-[ln-colpin=center]:overflow-visible!",
        },
      }}
    />
  );
}
