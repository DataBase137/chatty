import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"
import Friends from "@/containers/chat/friends"

const Page: NextPage = async () => {
  const { user, chats, friends } = await fetchData()

  return (
    <div className="flex h-full p-6">
      <Sidebar initChats={chats} user={user} globChat={null} />
      <Friends initFriends={friends} user={user} />
    </div>
  )
}

export default Page
