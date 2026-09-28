import { CodeView } from "@/components/site/code/code-view"
import { highlight } from "@/components/site/code/highlight"

export function Code({
  lang = "tsx",
  label = lang,
  children,
  ...props
}: {
  lang?: "tsx" | "json"
  label?: string
  framed?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  bodyClassName?: string
  children: string
}) {
  return (
    <CodeView
      lines={highlight(children, lang)}
      copy={children}
      label={label}
      {...props}
    />
  )
}
