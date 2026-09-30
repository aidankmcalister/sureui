import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: [
    "ts",
    "tsx",
    "mdx",
    ...(process.env.NODE_ENV === "development" ? ["dev.tsx"] : []),
  ],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter"],
  },
})

export default withMDX(nextConfig)
