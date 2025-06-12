"use client"

import { logOut } from "@/actions/auth"
import Chat from "@/components/chat/chat"
import { User } from "@prisma/client"
import { FC, useEffect, useState } from "react"
import { FaGear, FaPlus, FaRightFromBracket } from "react-icons/fa6"
import ChatModal from "../modal"
import { formatChatName } from "@/hooks/formatChatName"
import Pusher from "pusher-js"
import Link from "next/link"

interface SidebarProps {
  initChats: Chat[]
  user: User | null
  globChat: Chat | null
}

const Sidebar: FC<SidebarProps> = ({ initChats, user, globChat }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [chats, setChats] = useState<Chat[]>(initChats)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channels = chats.map((c) => {
      const channel = pusher.subscribe(`chat-${c.id}`)

      channel.bind("new-message", (data: { message: Message }) => {
        const message = data.message

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

    const channel = pusher.subscribe(`user-${user?.id}`)

    channel.bind("new-chat", (data: { chat: Chat }) => {
      const chat = data.chat

      !chats.includes(chat) && setChats((prev) => [chat, ...prev])
    })

    return () => {
      channels.forEach((channel) => {
        channel.unbind_all()
        pusher.unsubscribe(channel.name)
      })
    }
  }, [chats, user?.id])

  return (
    <>
      <div className="flex h-full min-w-80 flex-col gap-3 px-4">
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="pl-1">chats</h1>
            <button
              className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition hover:bg-opacity-70"
              onClick={() => setModalOpen(true)}
              name="create chat"
            >
              <FaPlus />
            </button>
          </div>
          <input
            type="text"
            placeholder="search chats"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
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
        <div className="flex w-full justify-between rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-3 py-1.5 text-opacity-70">
          <p className="flex h-full flex-col justify-center pl-2 text-sm font-medium">
            {user?.name}
          </p>
          <div className="flex items-center gap-0.5">
            <Link
              className="rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
              href="/settings"
            >
              <FaGear />
            </Link>
            <form onSubmit={logOut}>
              <button
                className="rounded-2xl p-2.5 text-sm transition hover:bg-red-300 hover:bg-opacity-40"
                type="submit"
                name="log out"
              >
                <FaRightFromBracket />
              </button>
            </form>
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
