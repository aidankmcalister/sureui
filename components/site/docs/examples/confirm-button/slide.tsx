"use client"

import { ChevronsRightIcon } from "lucide-react"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmButtonSlide() {
  const { deleteProject } = useActions()

  return (
    <ConfirmButton
      gesture="slide"
      variant="destructive"
      className="w-64"
      onConfirm={deleteProject}
    >
      Slide to delete
      <ChevronsRightIcon />
    </ConfirmButton>
  )
}
