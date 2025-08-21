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
  const supabase = await createClient()

  const $claims = await supabase.auth.getClaims()
  const $session = await supabase.auth.getSession()

  const accessToken = $session.data.session?.access_token

  const getUserData = () => {
    if ($claims.data && accessToken) {
      const claims = ClaimsSchema.safeParse($claims.data.claims)
      if (claims.success) {
        return {
          email: claims.data.email,
          accessToken,
        }
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
            {userData.email}
          </span>
          <LogoutButton />
        </div>
      )}
    </nav>
  )
}
