import { NextPage } from "next"
import { getUser } from "@/actions/auth"
import Sidebar from "@/containers/chat/sidebar"

const Page: NextPage = async () => {
  const user = await getUser()

  return (
    <div className="flex h-screen w-screen gap-3 p-8">
      <Sidebar user={user} />
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-text text-opacity-60">
          select a chat to start messaging
        </p>
      </div>
    </div>
  )
}

export default Page
