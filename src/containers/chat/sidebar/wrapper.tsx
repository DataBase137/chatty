import { FC } from "react"
import Sidebar from "."
import { getChats } from "@/actions/chat"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { getFriends } from "@/actions/friends"

const SidebarWrapper: FC = async () => {
  const user = await getUser()
  if (!user) redirect("/")

  const chats = await getChats()
  const friends = await getFriends()

  return <Sidebar initChats={chats} user={user} friends={friends} />
}

export default SidebarWrapper
