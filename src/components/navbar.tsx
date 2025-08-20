import { LogoutButton } from "@/components/logout-button"
import icon from "@/app/icon.svg"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import z from "zod"

const ClaimsSchema = z.object({
  email: z.string().email(),
})

export async function Navbar({ className }: { className?: string }) {
  const client = await createClient()

  const { data, error } = await client.auth.getClaims()

  const getUserData = () => {
    if (data) {
      const parsed = ClaimsSchema.safeParse(data.claims)
      if (parsed.success) {
        return parsed.data
      }
    }
    return null
  }

  const userData = getUserData()

  return (
    <nav className={cn("flex w-full bg-background border-b", className)}>
      <div className="flex items-center gap-2 grow">
        <Image src={icon} alt="MockMCP logo" className="h-6 w-6" />
        <span className="text-xl font-bold">MockMCP</span>
      </div>

      {userData && (
        <div className="flex gap-6 items-center">
          <span className="text-muted-foreground text-sm">
            Logged in as <strong>{userData.email}</strong>
          </span>
          <LogoutButton />
        </div>
      )}
    </nav>
  )
}
