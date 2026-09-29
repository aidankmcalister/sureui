import { cn } from "@/lib/utils"
import { Label } from "@/components/site/layout/frame"

type Column = { label: string; width: string; className?: string }

export function FramedTable({
  columns,
  rows,
  className,
}: {
  columns: Column[]
  rows: { key: string; cells: React.ReactNode[] }[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto border border-(--rule) bg-(--well)",
        className
      )}
    >
      <table className="w-full min-w-xl table-fixed border-collapse text-left">
        <colgroup>
          {columns.map((column) => (
            <col key={column.label} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-(--rule)">
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className="px-4 pt-3.5 pb-2.5 align-bottom font-normal"
              >
                <Label>{column.label}</Label>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--rule)">
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => (
                <td
                  key={columns[index].label}
                  className={cn(
                    "px-4 py-3 align-top [overflow-wrap:anywhere]",
                    columns[index].className
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
