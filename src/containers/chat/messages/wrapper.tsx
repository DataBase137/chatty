import { FC } from "react"
import Messages from "."
import { getMessages, verifyChat } from "@/actions/chat"
import { getUser } from "@/actions/auth"
import { getFriends } from "@/actions/friends"

const MessagesWrapper: FC<{ chatId?: string }> = async ({ chatId }) => {
  const user = await getUser()
  const friends = await getFriends()

  let messages: Message[] = []
  let chat: Chat | null = null

  if (chatId && chatId != "new") {
    chat = await verifyChat(chatId)
    messages = await getMessages(chatId)
  }

  if (chatId === "new") {
    chat = {
      isGroup: true,
      id: "new",
      name: "new message",
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messages: [],
      participants: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      ],
    }
  }

  return (
    chat && (
      <Messages
        initChat={chat}
        user={user}
        initMessages={messages}
        friends={friends}
      />
    )
  )
}

export default MessagesWrapper
