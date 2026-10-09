import { CopyButton } from "../../button/CopyButton";
import { Grid } from "@1771technologies/lytenyte-core";

export function DataGridCopyableCell({
  api,
  column,
  row,
}: Grid.T.CellRendererParams<any>) {
  if (!api.rowIsLeaf(row) || !row.data) return;

  const field = api.columnField(column, row);

  return (
    <div
      className={`flex items-center w-full h-full overflow-hidden ${typeof field !== "number" ? "justify-between" : "flex-row-reverse"}`}
    >
      <span className="truncate min-w-0 flex-1">{field ?? "-"}</span>

      {field ? <CopyButton text={field} /> : null}
    </div>
  );
}
