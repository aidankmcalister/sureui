import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function PropsTable({ rows }: { rows: string[][] }) {
  return (
    <div className="min-w-0 rounded-[10px] border bg-(--well) text-foreground">
      <div className="hidden px-2 sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">
            {rows.map(([name, type, value]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-muted-foreground">{type}</TableCell>
                <TableCell className="text-muted-foreground">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <dl className="divide-y text-sm sm:hidden">
        {rows.map(([name, type, value]) => (
          <div key={name} className="grid gap-1 p-4 font-mono">
            <dt className="font-medium">{name}</dt>
            <dd className="text-muted-foreground">{type}</dd>
            <dd className="text-xs text-muted-foreground">Default: {value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
