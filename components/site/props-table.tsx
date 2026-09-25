export function PropsTable({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Default</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map(([name, type, value]) => (
            <tr key={name} className="border-b last:border-0">
              <td className="p-3">{name}</td>
              <td className="p-3 text-muted-foreground">{type}</td>
              <td className="p-3 text-muted-foreground">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
