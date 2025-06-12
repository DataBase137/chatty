import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"
import Messages from "@/containers/chat/messages"
import { headers } from "next/headers"
import { Suspense } from "react"
import { SidebarSkeleton } from "@/components/skeletons/sidebar"
import { MessagesSkeleton } from "@/components/skeletons/messages"

const Page = async () => {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname")
  const chat = pathname?.slice(3)

  const { user, globChat, chats, messages } = await fetchData(chat)

  return (
    <div className="flex h-full gap-8 p-6">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar initChats={chats} user={user} globChat={globChat} />
      </Suspense>
      <Suspense fallback={<MessagesSkeleton />}>
        {user && globChat && (
          <Messages chat={globChat} user={user} initMessages={messages} />
        )}
      </Suspense>
    </div>
  )
}

export default Page
