import registry from "@/registry.json"

export const blocksLead =
  "Full screens built from SureUI components. The shadcn CLI installs each one into your `components/` folder as app code you edit, along with the SureUI components it uses."

export const blocks = registry.items
  .filter((item) => item.type === "registry:block")
  .map((item) => ({
    name: item.name,
    title: item.title,
    description: item.description,
    files: item.files.map((file) => ({
      path: file.path,
      name: file.target.replace("@components/", ""),
    })),
  }))

export type Block = (typeof blocks)[number]
