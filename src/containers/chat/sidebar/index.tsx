"use client"

import { logOut } from "@/actions/auth"
import Chat from "@/components/chat/chat"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js"
import { FC, useEffect, useState } from "react"
import { FaGear, FaPlus, FaRightFromBracket } from "react-icons/fa6"
import ChatModal from "../modal"

interface SidebarProps {
  initChats: Chat[]
  user: User | null
  globChat: Chat | null
  friends: FriendRequest[]
}

const Sidebar: FC<SidebarProps> = ({ initChats, user, globChat, friends }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>(initChats)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channels = chats.map((c) => {
      const channel = pusher.subscribe(`chat-${c.id}`)

      channel.bind("new-message", (data: any) => {
        const message: Message = JSON.parse(data.message)

        setChats((chats) => {
          const chatIndex = chats.findIndex(
            (c: Chat) => c.id === message.chatId
          )
          const newChats = [...chats]

          const updatedChat: Chat = {
            ...newChats[chatIndex],
            messages: [message],
            lastMessageAt: new Date(message.createdAt),
          }

          newChats.splice(chatIndex, 1)
          newChats.unshift(updatedChat)

          return newChats
        })
      })

      return channel
    })

    return () => {
      channels.forEach((channel) => {
        pusher.unsubscribe(channel.name)
      })
    }
  }, [chats])

  const formatChatName = (chat: Chat, userId: string) => {
    if (chat.name && chat.isGroup) {
      return chat.name
    }
    return chat.participants
      .filter((participant) => participant.id !== userId)
      .map((participant) => participant.name)
      .join(", ")
  }

  return (
    <>
      <div className="flex h-full min-w-80 flex-col gap-3 px-4 transition-transform duration-300 ease-in-out">
        {/* top module */}
        <div className="flex flex-col gap-3 pb-2">
          {/* very top */}
          <div className="flex justify-between">
            {/* header */}
            <h1 className="pl-1">chats</h1>
            {/* create chat button */}
            <button
              className="bg-sunset rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
              onClick={() => setModalOpen(true)}
            >
              <FaPlus />
            </button>
          </div>
          {/* search bar */}
          <input
            type="text"
            placeholder="search chats"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-sunset w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
          />
        </div>
        {/* chat list */}
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          {chats &&
            chats
              .filter((chat) =>
                formatChatName(chat, user?.id || "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                <Chat
                  key={chat.id}
                  chat={chat}
                  globChat={globChat}
                  user={user}
                />
              ))}
        </div>
        {/* bottom module */}
        <div className="flex w-full justify-between rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-3 py-1.5 text-opacity-70 transition-all">
          <p className="flex h-full flex-col justify-center pl-2 text-sm font-medium">
            {user?.name}
          </p>
          <div className="flex items-center gap-0.5">
            {/* settings button */}
            <button
              className="rounded-2xl p-2.5 text-sm hover:bg-slate-300 hover:bg-opacity-40"
              onClick={() => router.push("/settings")}
            >
              <FaGear />
            </button>
            {/* log out button */}
            <button
              className="rounded-2xl p-2.5 text-sm hover:bg-slate-300 hover:bg-opacity-40"
              onClick={logOut}
            >
              <FaRightFromBracket />
            </button>
          </div>
        </div>
      </div>
      {user && (
        <ChatModal
          userId={user.id}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
