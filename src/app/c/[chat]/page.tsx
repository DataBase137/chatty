import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"
import Messages from "@/containers/chat/messages"
import { headers } from "next/headers"

const Page = async () => {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname")
  const chat = pathname?.slice(3)

  const { user, globChat, chats, messages } = await fetchData(chat)

  return (
    <div className="flex h-full gap-8 p-6">
      <Sidebar initChats={chats} user={user} globChat={globChat} />
      {user && globChat && (
        <Messages chat={globChat} user={user} initMessages={messages} />
      )}
    </div>
  )
}

export default Page
