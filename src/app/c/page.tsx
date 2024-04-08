import { getUser } from "@/actions/auth"
import Messages from "@/containers/chat/messages"
import Sidebar from "@/containers/chat/sidebar"
import { NextPage } from "next"

const Page: NextPage = async () => {
  const user = await getUser()

  return (
    <div className="flex h-screen w-screen gap-3 p-10">
      <Sidebar user={user} />
      <Messages user={user} />
    </div>
  )
}

export default Page
