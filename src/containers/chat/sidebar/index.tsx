"use client"

import { FC, useCallback, useEffect, useState } from "react"
import { createChat, getChats } from "@/actions/chat"
import Pusher from "pusher-js"
import { FaGear, FaRightFromBracket } from "react-icons/fa6"
import { FaPlus } from "react-icons/fa"
import { logOut } from "@/actions/auth"
import { User } from "@prisma/client"
import Link from "next/link"

interface SidebarProps {
  user: User
  chatId?: string
}

const DateFormat: FC<{ date: Date }> = ({ date }) => {
  const formatTime = (date: Date) => {
    const diffMilliseconds = Date.now() - date.getTime()
    const diffSeconds = Math.floor(diffMilliseconds / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffYears = Math.floor(diffDays / 365)

    if (diffYears > 0) {
      return `${diffYears}y`
    } else if (diffWeeks > 0) {
      return `${diffWeeks}w`
    } else if (diffDays > 0) {
      return `${diffDays}d`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`
    } else {
      return `Now`
    }
  }

  const [formattedTime, setFormattedTime] = useState(() => formatTime(date))

  useEffect(() => {
    const interval = setInterval(
      () => {
        setFormattedTime(formatTime(date))
      },
      60000,
      date
    )

    return () => clearInterval(interval)
  }, [date])

  useEffect(() => {
    setFormattedTime(formatTime(date))
  }, [date])

  return <h4 className="text-lg">{formattedTime}</h4>
}

const Sidebar: FC<SidebarProps> = ({ user, chatId }) => {
  const [chats, setChats] = useState<Chat[]>([])

  const fetchChats = useCallback(async () => {
    const chats = await getChats(user.id)

    setChats(chats || [])
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
        const chatIndex = chats.findIndex((chat) => chat.id === message.chatId)
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

    return () => {
      pusher.unsubscribe(`chat-${chatId}`)
    }
  }, [chatId])

  const handleCreateChat = async () => {
    const chat = await createChat(user.id)

    setChats([chat, ...chats])
  }

  return (
    <div className="flex h-full w-80 flex-col gap-6">
      <div className="flex h-12 w-full gap-4 bg-bg">
        <input
          placeholder="search chats"
          name="text"
          className="h-12 w-64 rounded-xl bg-neutral bg-opacity-80 px-4 text-base text-text outline-0 hover:bg-text hover:bg-opacity-[0.08] focus:bg-text focus:bg-opacity-10"
          autoComplete="off"
        />
        <button onClick={handleCreateChat} className="button">
          <FaPlus />
        </button>
      </div>
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        {chats &&
          chats.map((chat) => (
            <Link
              href={`/c/${chat.id}`}
              className={`${chatId === chat.id ? "bg-text bg-opacity-15" : "bg-neutral bg-opacity-80"} flex w-full flex-col justify-center gap-[6px] rounded-xl px-5 py-[18px] text-text text-opacity-60 hover:bg-text hover:bg-opacity-10`}
              key={chat.id}
            >
              <div className="flex w-full justify-between">
                <h3 className="text-xl font-medium">{chat.name}</h3>
                <DateFormat date={chat.lastMessageAt} />
              </div>
              <p>{`${chat.messages?.length ? `${chat.messages && chat.messages[0]?.author.name === user.name ? "you" : chat.messages?.[0]?.author.name}: ${chat.messages[0].text.slice(0, 24)}${chat.messages[0].text.length >= 24 ? "..." : ""}` : "send a message"}`}</p>
            </Link>
          ))}
      </div>
      <div className="flex w-full items-center gap-2">
        <div className="flex h-full w-full cursor-pointer items-center rounded-xl bg-neutral bg-opacity-80 px-4 hover:bg-text hover:bg-opacity-10">
          <div className="text-base font-medium text-text text-opacity-70">
            {user.name}
          </div>
        </div>
        <Link href="/settings" className="button">
          <FaGear />
        </Link>
        <button onClick={() => logOut()} className="button">
          <FaRightFromBracket />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
