import { getUser } from "@/actions/auth"
import { verifyChat } from "@/actions/chat"
import Messages from "@/containers/chat/messages"
import Sidebar from "@/containers/chat/sidebar"
import { NextPage } from "next"

interface PageProps {
  params: {
    chat: string
  }
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const user = await getUser()
  const chat = await verifyChat(user.id, params.chat)

  return (
    <div className="flex h-screen w-screen gap-3 p-10">
      <Sidebar user={user} chatId={chat?.id} />
      <Messages user={user} chatId={chat?.id} chatName={chat?.name} />
    </div>
  )
}

export default Page

export const dynamic = "force-dynamic"
