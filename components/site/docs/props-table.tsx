import { cn } from "@/lib/utils"
import { FramedTable } from "@/components/site/docs/framed-table"

const columns = [
  {
    label: "Prop",
    width: "30%",
    className: "font-mono text-[13px] font-medium text-(--ink)",
  },
  {
    label: "Type",
    width: "45%",
    className: "font-mono text-[13px] text-(--code-attribute)",
  },
  {
    label: "Default",
    width: "25%",
    className: "font-mono text-[13px] text-(--ink-muted)",
  },
]

export function PropsTable({ rows }: { rows: string[][] }) {
  return (
    <FramedTable
      columns={columns}
      rows={rows.map(([name, type, value]) => ({
        key: name,
        cells: [
          name,
          type,
          <span
            key="value"
            className={cn(value === "required" && "text-(--mark-text)")}
          >
            {value}
          </span>,
        ],
      }))}
    />
  )
}
