export const githubUrl = "https://github.com/aidankmcalister/sureui"

export const siteUrl = "https://sureui.com"

export const items = [
  "confirm-button",
  "confirm-menu-item",
  "type-to-confirm",
  "confirm-dialog",
  "undo-toast",
]

export function addArgs(names: string[]) {
  return `add ${names.map((name) => `@sureui/${name}`).join(" ")}`
}
