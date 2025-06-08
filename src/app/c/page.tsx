import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"

const Page: NextPage = async () => {
  const { user, chats, friends } = await fetchData()

  return (
    <div className="flex h-full p-6">
      <Sidebar
        initChats={chats}
        user={user}
        globChat={null}
        friends={friends}
      />
    </div>
  )
}

export default Page
