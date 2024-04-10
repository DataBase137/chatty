"use client"

import { FC, useCallback, useEffect, useState } from "react"
import { getChats } from "@/actions/chat"
import { User } from "@prisma/client"
import Chat from "./chat"
import { Button, Input } from "../components"
import Pusher from "pusher-js"

interface SidebarProps {
  user: User
  chatId?: string
}

const Sidebar: FC<SidebarProps> = ({ user, chatId }) => {
  const [chats, setChats] = useState<Chat[]>([])

  const fetchChats = useCallback(async () => {
    const chats = await getChats(user.id)

    if (chats) setChats(chats)
  }, [user.id])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`chat-${chatId}`)

    channel.bind("new-message", (data: any) => {
      const message: Message = JSON.parse(data.message)

      setChats((chats) => {
        // TODO: Make this reload the whole chat so it can update the created at property as well
        const chatIndex = chats.findIndex((chat) => chat.id === message.chatId)
        const newChats = [...(chats as Chat[])]

        newChats[chatIndex].messages = [message]

        return newChats
      })
    })

    return () => {
      pusher.unsubscribe(`chat-${chatId}`)
    }
  }, [chatId])

  return (
    <div className="flex h-full w-80 flex-col gap-6">
      <div className="flex h-12 w-full gap-4 bg-bg">
        <Input placeholder="search chats" small />
        <Button userId={user.id} />
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto">
        {chats &&
          chats.map((chat) => (
            <Chat
              key={chat.id}
              chat={chat}
              selected={chatId === chat.id}
              you={chat.messages && chat.messages[0]?.author.name === user.name}
              userId={user.id}
            />
          ))}
      </div>
    </div>
  )
}

export default Sidebar
