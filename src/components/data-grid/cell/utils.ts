import { INTL_DATE_FORMAT, INTL_DATETIME_FORMAT } from "@constants/datetime";
import { dateFormat, dateTimeFormat } from "@utils/datetime";
import { Grid } from "@1771technologies/lytenyte-core";

export function dateCellFormatter(key: string) {
  return ({ row }: { row: Grid.T.RowNode<any> }) => {
    if (row.kind === "branch" || !row.data) return null;

    const rawValue = row.data[key];

    if (!rawValue) return null;

    return dateFormat(rawValue, {
      format: INTL_DATE_FORMAT,
    });
  };
}

export function dateTimeCellFormatter(key: string) {
  return ({ row }: { row: Grid.T.RowNode<any> }) => {
    if (row.kind === "branch" || !row.data) return null;

    const rawValue = row.data[key];

    if (!rawValue) return null;

    return dateTimeFormat(rawValue, {
      format: INTL_DATETIME_FORMAT,
    });
  };
}

export function numberCellFormatter(key: string) {
  return ({ row }: { row: Grid.T.RowNode<any> }) => {
    const rawValue = row.data[key];

    if (!rawValue) return "0";

    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      rawValue,
    );
  };
}
