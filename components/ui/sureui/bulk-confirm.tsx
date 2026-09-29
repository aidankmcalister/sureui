"use client"

import * as React from "react"

import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import { type ConfirmationOptions } from "@/components/ui/sureui/confirmation"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

interface BulkConfirmProps extends Pick<
  ConfirmationOptions,
  "onConfirm" | "onCancel" | "onConfirmError"
> {
  count: number
  label: (count: number) => React.ReactNode
  thresholds?: { undo?: number; clickAgain?: number }
  errorLabel?: React.ReactNode
  variant?: ConfirmButtonProps["variant"]
  disabled?: boolean
  className?: string
}

function BulkConfirm(props: BulkConfirmProps) {
  const {
    count,
    label,
    thresholds,
    onConfirm,
    onCancel,
    onConfirmError,
    errorLabel,
    variant,
    disabled,
    className,
  } = props
  const { undo = 10, clickAgain = 100 } = thresholds ?? {}
  const level =
    count <= undo ? "undo" : count <= clickAgain ? "click-again" : "type"

  if (level === "type") {
    return (
      <TypeToConfirm
        key={level}
        phrase={String(count)}
        confirmLabel={label(count)}
        variant={variant}
        errorLabel={errorLabel}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        onConfirmError={onConfirmError}
        className={className}
      />
    )
  }

  return (
    <ConfirmButton
      key={level}
      gesture={level === "undo" ? "click" : "click-again"}
      undo={level === "undo"}
      variant={variant}
      errorLabel={errorLabel}
      disabled={disabled || count === 0}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onConfirmError={onConfirmError}
      className={className}
    >
      {label(count)}
    </ConfirmButton>
  )
}

export { BulkConfirm, type BulkConfirmProps }
