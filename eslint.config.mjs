import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Note: there should be no other properties in this object
    // https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
    ignores: ["supabase/*"],
  },
]

export default eslintConfig
