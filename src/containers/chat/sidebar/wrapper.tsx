import { FC } from "react"
import Sidebar from "."
import { getChats } from "@/actions/chat"
import { getUser } from "@/actions/auth"
import { redirect } from "next/navigation"

const SidebarWrapper: FC = async () => {
  const user = await getUser()
  if (!user) redirect("/")

  const chats = await getChats(user.id)

  return <Sidebar initChats={chats} user={user} />
}

export default SidebarWrapper
