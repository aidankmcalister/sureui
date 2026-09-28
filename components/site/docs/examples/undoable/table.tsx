"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLog } from "@/components/site/docs/preview"

const initialBranches = [
  { name: "feature/billing-v2", updated: "2 hours ago" },
  { name: "fix/login-redirect", updated: "Yesterday" },
  { name: "chore/bump-deps", updated: "3 days ago" },
]

export default function UndoableTable() {
  const log = useLog()
  const [branches, setBranches] = React.useState(initialBranches)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Branch</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.map((branch) => (
          <Undoable
            key={branch.name}
            render={<TableRow />}
            label={`Deleted ${branch.name}`}
            onConfirm={() => {
              setBranches((current) =>
                current.filter((item) => item.name !== branch.name)
              )
              log(`Deleted ${branch.name}`)
            }}
            onCancel={() => log(`Undone, ${branch.name} kept`)}
          >
            {({ remove }) => (
              <>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.updated}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={remove}>
                    Delete
                  </Button>
                </TableCell>
              </>
            )}
          </Undoable>
        ))}
      </TableBody>
    </Table>
  )
}
