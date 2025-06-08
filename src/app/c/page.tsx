"use client"

import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import { FC, useCallback, useEffect, useState } from "react"
import { FaGear, FaRightFromBracket } from "react-icons/fa6"
import { FaPlus } from "react-icons/fa"
import { logOut } from "@/actions/auth"
import { User } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ChatModal from "@/containers/chat/modal"

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

const Page: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const getData = useCallback(async () => {
    const data = await fetchData()
    return data
  }, [])

  useEffect(() => {
    getData().then(({ user, chats }) => {
      setUser(user)
      setChats(chats)
    })
  }, [getData, router])

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
    <div className="flex h-screen w-screen gap-8 p-8">
      {/* sidebar */}
      <div className="flex min-w-80 flex-col gap-3 px-4">
        {/* top module */}
        <div className="flex flex-col gap-3 pb-2">
          {/* very top */}
          <div className="flex justify-between">
            {/* header */}
            <h1 className="pl-1">chats</h1>
            {/* create chat button */}
            <button
              className="bg-secondary rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
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
            className="focus:ring-secondary w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
          />
        </div>
        {/* chat list */}
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          {chats &&
            chats
              .filter((chat) =>
                chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                // chat
                <Link
                  className="flex flex-col gap-1 rounded-2xl bg-slate-300 bg-opacity-20 px-5 py-4 transition-all hover:bg-opacity-40"
                  href={`/c/${chat.id}`}
                  key={chat.id}
                >
                  {/* top */}
                  <div className="flex w-full justify-between">
                    <h3>{formatChatName(chat, user?.id || "")}</h3>
                    <DateFormat
                      className="text-xs font-light"
                      date={chat.lastMessageAt}
                    />
                  </div>
                  {/* bottom */}
                  <p className="text-nowrap text-sm text-slate-600">{`${chat.messages?.length ? `${chat.messages && chat.messages[0]?.author.name === user?.name ? "you" : chat.messages?.[0]?.author.name}: ${chat.messages[0].text.slice(0, 24)}${chat.messages[0].text.length >= 24 ? "..." : ""}` : "send a message"}`}</p>
                </Link>
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
              onClick={() => logOut()}
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
    </div>
  )
}

export default Page
