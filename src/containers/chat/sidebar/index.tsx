"use client"

import { logOut } from "@/actions/auth"
import Chat from "@/components/chat/chat"
import { User } from "@prisma/client"
import { FC, useEffect, useState } from "react"
import { FaGear, FaPlus, FaRightFromBracket } from "react-icons/fa6"
import { formatChatName } from "@/hooks/formatChatName"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { usePusher } from "@/hooks/usePusher"

interface SidebarProps {
  initChats: Chat[]
  user: User
}

const Sidebar: FC<SidebarProps> = ({ initChats, user }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [chats, setChats] = useState<Chat[]>(initChats)
  const pathname = usePathname()
  const globChatId = pathname.slice(3)
  const router = useRouter()

  useEffect(() => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== "new"))

    if (pathname === "/c/new") {
      setChats((prev) => [
        {
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
        },
        ...prev,
      ])
    }
  }, [pathname, user])

  const { subscribe, unsubscribe } = usePusher()

  useEffect(() => {
    subscribe(`user-${user.id}`, "new-chat", (data: { chat: Chat }) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === data.chat.id)) return prev
        return [data.chat, ...prev]
      })

      subscribe(
        `chat-${data.chat.id}`,
        "new-message",
        (data: { message: Message }) => {
          setChats((prev) => {
            const idx = prev.findIndex((c) => c.id === data.message.chatId)
            if (idx === -1) return prev

            const updated = {
              ...prev[idx],
              messages: [data.message],
              lastMessageAt: new Date(data.message.createdAt),
            }

            const newChats = [...prev]
            newChats.splice(idx, 1)
            newChats.unshift(updated)
            return newChats
          })
        }
      )

      subscribe(
        `chat-${data.chat.id}`,
        "unsend-message",
        (data: { messageId: string; lastMessage: Message | null }) => {
          setChats((prev) => {
            const idx = prev.findIndex(
              (ch) =>
                ch.messages &&
                ch.messages.length > 0 &&
                ch.messages[0].id === data.messageId
            )
            if (idx === -1) return prev

            const chat = prev[idx]
            if (!chat.messages || chat.messages[0].id !== data.messageId)
              return prev

            const updated: Chat = {
              ...chat,
              messages: data.lastMessage ? [data.lastMessage] : [],
              lastMessageAt: data.lastMessage
                ? new Date(data.lastMessage.createdAt)
                : new Date(),
            }

            const newChats = [...prev]
            newChats.splice(idx, 1)
            newChats.unshift(updated)
            return newChats
          })
        }
      )

      subscribe(
        `chat-${data.chat.id}`,
        "edit-message",
        (data: { message: Message }) => {
          setChats((prev) => {
            const idx = prev.findIndex((ch) => ch.id === data.message.chatId)
            if (idx === -1) return prev

            const updated = {
              ...prev[idx],
              messages: [data.message],
              lastMessageAt: new Date(data.message.createdAt),
            }

            const newChats = [...prev]
            newChats.splice(idx, 1)
            newChats.unshift(updated)
            return newChats
          })
        }
      )

      subscribe(
        `chat-${data.chat.id}`,
        "rename-chat",
        (data: { chat: Chat }) => {
          setChats((prev) => {
            const idx = prev.findIndex((c) => c.id === data.chat.id)
            if (idx === -1) return prev

            const newChats = [...prev]
            newChats[idx] = {
              ...newChats[idx],
              name: data.chat.name,
            }

            return newChats
          })
        }
      )

      subscribe(
        `chat-${data.chat.id}`,
        "leave-chat",
        (data: { chat: Chat }) => {
          setChats((prev) => {
            const idx = prev.findIndex((c) => c.id === data.chat.id)
            if (idx === -1) return prev

            const newChats = [...prev]
            newChats[idx] = {
              ...newChats[idx],
              participants: data.chat.participants,
            }

            return newChats
          })
        }
      )
    })

    initChats.forEach((c) => {
      subscribe(`chat-${c.id}`, "new-message", (data: { message: Message }) => {
        setChats((prev) => {
          const idx = prev.findIndex((ch) => ch.id === data.message.chatId)
          if (idx === -1) return prev

          const updated = {
            ...prev[idx],
            messages: [data.message],
            lastMessageAt: new Date(data.message.createdAt),
          }

          const newChats = [...prev]
          newChats.splice(idx, 1)
          newChats.unshift(updated)
          return newChats
        })
      })

      subscribe(
        `chat-${c.id}`,
        "unsend-message",
        (data: { messageId: string; lastMessage: Message | null }) => {
          setChats((prev) => {
            const idx = prev.findIndex(
              (ch) =>
                ch.messages &&
                ch.messages.length > 0 &&
                ch.messages[0].id === data.messageId
            )
            if (idx === -1) return prev

            const chat = prev[idx]
            if (!chat.messages || chat.messages[0].id !== data.messageId)
              return prev

            const updated: Chat = {
              ...chat,
              messages: data.lastMessage ? [data.lastMessage] : [],
              lastMessageAt: data.lastMessage
                ? new Date(data.lastMessage.createdAt)
                : new Date(),
            }

            const newChats = [...prev]
            newChats.splice(idx, 1)
            newChats.unshift(updated)
            return newChats
          })
        }
      )

      subscribe(
        `chat-${c.id}`,
        "edit-message",
        (data: { message: Message }) => {
          setChats((prev) => {
            const idx = prev.findIndex((ch) => ch.id === data.message.chatId)
            if (idx === -1) return prev

            const updated = {
              ...prev[idx],
              messages: [data.message],
              lastMessageAt: new Date(data.message.createdAt),
            }

            const newChats = [...prev]
            newChats.splice(idx, 1)
            newChats.unshift(updated)
            return newChats
          })
        }
      )

      subscribe(`chat-${c.id}`, "rename-chat", (data: { chat: Chat }) => {
        setChats((prev) => {
          const idx = prev.findIndex((c) => c.id === data.chat.id)
          if (idx === -1) return prev

          const newChats = [...prev]
          newChats[idx] = {
            ...newChats[idx],
            name: data.chat.name,
          }

          return newChats
        })
      })

      subscribe(`chat-${c.id}`, "leave-chat", (data: { chat: Chat }) => {
        if (
          !data.chat.participants.includes({
            id: user.id,
            email: user.email,
            name: user.name,
          })
        ) {
          setChats((prev) => prev.filter((c) => c.id !== data.chat.id))
          unsubscribe(`chat-${c.id}`)

          if (data.chat.id === globChatId) {
            router.push("/c")
          }
        } else {
          setChats((prev) => {
            const idx = prev.findIndex((c) => c.id === data.chat.id)
            if (idx === -1) return prev

            const newChats = [...prev]
            newChats[idx] = {
              ...newChats[idx],
              participants: data.chat.participants,
            }

            return newChats
          })
        }
      })

      subscribe(`chat-${c.id}`, "delete-chat", (data: { chatId: string }) => {
        setChats((prev) => prev.filter((c) => c.id !== data.chatId))
        unsubscribe(`chat-${c.id}`)
        if (data.chatId === globChatId) router.push("/c")
      })
    })
  }, [user, initChats, subscribe, globChatId, router, unsubscribe])

  return (
    <div className="flex h-full min-w-80 flex-col gap-3 px-4">
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="pl-1">chats</h1>

          <Link
            className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition hover:bg-opacity-70"
            href="/c/new"
          >
            <FaPlus />
          </Link>
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
              formatChatName(chat, user.id || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((chat) => (
              <Chat
                key={chat.id}
                chat={chat}
                globChatId={globChatId}
                user={user}
              />
            ))}
      </div>

      <div className="flex w-full justify-between rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-3 py-1.5 text-opacity-70 shadow-sm">
        <p className="flex h-full flex-col justify-center pl-2 text-sm font-medium">
          {user.name}
        </p>

        <div className="flex items-center gap-0.5">
          <Link
            className="rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
            href="/settings"
          >
            <FaGear />
          </Link>

          <button
            className="rounded-2xl p-2.5 text-sm transition hover:bg-red-300 hover:bg-opacity-40"
            name="log out"
            onClick={logOut}
          >
            <FaRightFromBracket />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
