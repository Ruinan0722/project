"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/components/app/role-context"

export default function Home() {
  const router = useRouter()
  const { role } = useRole()

  useEffect(() => {
    router.replace(role === "customer" ? "/intake" : "/home")
  }, [role, router])

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">正在进入平台…</div>
  )
}
