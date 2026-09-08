import { Card } from "@/components/ui/Card";

type Column<Row extends { id: string }> = {
  label: string;
  value: (row: Row) => string | number;
};

export function AdminDataTable<Row extends { id: string }>({ title, description, rows, columns }: {
  title: string;
  description: string;
  rows: Row[];
  columns: Column<Row>[];
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-ink-soft">{description}</p>
      <Card className="mt-7 overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead><tr className="border-b border-border text-ink-faint">{columns.map((column) => <th key={column.label} className="px-5 py-3 font-medium">{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)} className="border-b border-border last:border-b-0">{columns.map((column) => <td key={column.label} className="px-5 py-3 text-ink">{column.value(row)}</td>)}</tr>)}</tbody>
        </table>
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-ink-faint">No records yet.</p>}
      </Card>
    </div>
  );
}
