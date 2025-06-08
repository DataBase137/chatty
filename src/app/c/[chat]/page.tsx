import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"
import Messages from "@/containers/chat/messages"

const Page: NextPage<{ params: { chat: string } }> = async (props) => {
  const chat = (await props.params).chat

  const { user, globChat, chats, messages, friends } = await fetchData(chat)

  return (
    <div className="flex h-full gap-8 p-6">
      <Sidebar
        initChats={chats}
        user={user}
        globChat={globChat}
        friends={friends}
      />
      {user && globChat && (
        <Messages chat={globChat} user={user} initMessages={messages} />
      )}
    </div>
  )
}

export default Page
