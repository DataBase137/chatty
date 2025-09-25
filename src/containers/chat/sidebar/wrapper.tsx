import { FC } from "react"
import Sidebar from "."
import { getChats } from "@/actions/chat"
import { getUser } from "@/actions/auth"

const SidebarWrapper: FC = async () => {
  const user = await getUser()
  const chats = await getChats(user.id)

  return <Sidebar initChats={chats} user={user} />
}

export default SidebarWrapper
