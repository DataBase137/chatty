import { SidebarSkeleton } from "@/components/skeletons/sidebar"
import SidebarWrapper from "@/containers/chat/sidebar/wrapper"
import { Suspense } from "react"
import { headers } from "next/headers"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname")
  const main = pathname === "/c"

  return (
    <div className="flex h-full gap-8 p-6">
      <div className={`min-w-80 ${main ? "w-full md:w-80" : "hidden md:flex"}`}>
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarWrapper />
        </Suspense>
      </div>
      {children}
    </div>
  )
}
