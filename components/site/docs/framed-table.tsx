import * as React from "react"

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
    <div className={cn("border border-(--rule) bg-(--well)", className)}>
      <table className="hidden w-full table-fixed border-collapse text-left sm:table">
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
                className="h-10 px-4 font-normal"
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
      <div className="divide-y divide-(--rule) sm:hidden">
        {rows.map((row) => (
          <dl
            key={row.key}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 p-4"
          >
            {row.cells.map((cell, index) =>
              index === 0 ? (
                <dt
                  key={columns[index].label}
                  className={cn(
                    "col-span-2 [overflow-wrap:anywhere]",
                    columns[index].className
                  )}
                >
                  {cell}
                </dt>
              ) : (
                <React.Fragment key={columns[index].label}>
                  <dt className="whitespace-nowrap">
                    <Label>{columns[index].label}</Label>
                  </dt>
                  <dd
                    className={cn(
                      "[overflow-wrap:anywhere]",
                      columns[index].className
                    )}
                  >
                    {cell}
                  </dd>
                </React.Fragment>
              )
            )}
          </dl>
        ))}
      </div>
    </div>
  )
}
