import { NextPage } from "next"
import { getUser } from "@/actions/auth"
import { verifyChat } from "@/actions/chat"
import Messages from "@/containers/chat/messages"
import Sidebar from "@/containers/chat/sidebar"
import { redirect } from "next/navigation"

interface PageProps {
  params: {
    chat: string
  }
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const user = await getUser()
  const chat = await verifyChat(user.id, params.chat)

  if (!chat) redirect("/c")

  return (
    <div className="flex h-screen w-screen gap-3 p-8">
      <Sidebar user={user} chatId={chat.id} />
      <Messages user={user} chatId={chat.id} chatName={chat.name} />
    </div>
  )
}

export default Page
