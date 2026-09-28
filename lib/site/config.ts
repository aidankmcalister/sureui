export const githubUrl = "https://github.com/aidankmcalister/sureui"

export const siteUrl = "https://sureui.com"

export const items = [
  "confirm-button",
  "confirm-menu-item",
  "type-to-confirm",
  "confirm-dialog",
  "confirm-popover",
  "confirm-switch",
  "consequences",
  "undo-toast",
  "undoable",
]

export function addArgs(names: string[]) {
  return `add ${names.map((name) => `@sureui/${name}`).join(" ")}`
}
