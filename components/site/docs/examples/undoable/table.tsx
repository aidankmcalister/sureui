"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Undoable } from "@/components/ui/sureui/undoable"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useActions } from "@/components/site/docs/preview"

export default function UndoableTable() {
  const { deleteBranch } = useActions()
  const [branches, setBranches] = React.useState([
    "feature/billing-v2",
    "fix/login-redirect",
  ])

  return (
    <Table>
      <TableBody>
        {branches.map((branch) => (
          <Undoable
            key={branch}
            render={<TableRow />}
            label={`Deleted ${branch}`}
            onConfirm={() => {
              deleteBranch(branch)
              setBranches((current) =>
                current.filter((item) => item !== branch)
              )
            }}
          >
            {({ remove }) => (
              <>
                <TableCell>{branch}</TableCell>
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
