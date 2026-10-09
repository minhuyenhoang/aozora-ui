import type { Grid } from "@1771technologies/lytenyte-core";
import { BadgeWithDot } from "../../status/badge/BadgeWithDot";
import type { BadgeColors } from "../../status/badge/constants";

const statusColors: Record<string, BadgeColors> = {
  paid: "success",
  pending: "warning",
  refunded: "sky",
  cancelled: "destructive",
};

export function DataGridStatusCell({
  api,
  column,
  row,
}: Grid.T.CellRendererParams<any>) {
  if (!api.rowIsLeaf(row) || !row.data) return;

  const status = row.data[column.id];
  const color = statusColors[String(status).toLowerCase()] ?? "gray";

  return (
    <BadgeWithDot type="pill-color" color={color}>
      {status}
    </BadgeWithDot>
  );
}
