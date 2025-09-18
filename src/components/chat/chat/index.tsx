"use client"

import { formatChatName } from "@/hooks/formatChatName"
import { User } from "@prisma/client"
import Link from "next/link"
import { FC, useEffect, useState } from "react"

const DateFormat: FC<{ date: Date; className?: string }> = ({
  date,
  className,
}) => {
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

  return <h4 className={className}>{formattedTime}</h4>
}

interface ChatProps {
  chat: Chat
  globChat: Chat | null
  user: User | null
}

const Chat: FC<ChatProps> = ({ chat, globChat, user }) => {
  return (
    <Link
      className={`flex flex-col gap-1 rounded-2xl bg-slate-300 ${chat.id === globChat?.id ? "bg-opacity-70" : "bg-opacity-20 hover:bg-opacity-40"} px-5 py-4 transition-all`}
      href={`/c/${chat.id}`}
      key={chat.id}
    >
      <div className="flex w-full justify-between">
        <h3 className="text-[0.95rem] font-semibold">
          {formatChatName(chat, user?.id || "")}
        </h3>

        <DateFormat
          className="text-xs font-light"
          date={new Date(chat.lastMessageAt)}
        />
      </div>

      <p className="text-nowrap text-xs text-slate-600">{`${chat.messages?.length ? `${chat.messages && chat.messages[0]?.author.name === user?.name ? "you" : chat.messages?.[0]?.author.name}: ${chat.messages[0].text.slice(0, 24)}${chat.messages[0].text.length >= 24 ? "..." : ""}` : "send a message"}`}</p>
    </Link>
  )
}

export default Chat
