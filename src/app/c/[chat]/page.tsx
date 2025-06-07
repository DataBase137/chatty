"use client"

import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import { FC, Fragment, useRef, useCallback, useEffect, useState } from "react"
import { createChat } from "@/actions/chat"
import { FaGear, FaRightFromBracket } from "react-icons/fa6"
import { FaPlus } from "react-icons/fa"
import { logOut } from "@/actions/auth"
import { User } from "@prisma/client"
import Link from "next/link"
import { sendMessage } from "@/actions/chat"
import { FaPaperPlane } from "react-icons/fa6"
import Pusher from "pusher-js"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"

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
  const initChat = useParams<{ chat: string }>().chat
  const [globChat, setGlobChat] = useState<Chat | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const chat = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const getData = useCallback(async () => {
    const data = await fetchData(initChat)
    return data
  }, [initChat])

  useEffect(() => {
    getData().then(({ user, chat, chats, messages }) => {
      setUser(user)
      setGlobChat(chat)
      setChats(chats)
      setMessages(messages)
    })
  }, [getData])

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`chat-${globChat?.id}`)

    channel.bind("new-message", (data: any) => {
      const message: Message = JSON.parse(data.message)

      setMessages((messages) => [...(messages || []), message])

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
      pusher.unsubscribe(`chat-${globChat?.id}`)
    }
  }, [globChat])

  const handleCreateChat = async () => {
    if (user) {
      const chat = await createChat(user.id)
      setChats([chat, ...chats])
    }
  }

  useEffect(() => {
    if (chat.current) {
      chat.current.scrollTop = chat.current.scrollHeight
    }
  }, [messages])

  const formatDateDiff = (createdAt: Date) => {
    const messageDate = new Date(createdAt)
    const currentDate = new Date()

    const messageDateWithoutTime = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    ).getTime()
    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).getTime()

    const dayDifference = Math.floor(
      (currentDateWithoutTime - messageDateWithoutTime) / (1000 * 60 * 60 * 24)
    )

    if (dayDifference === 0) {
      return `${messageDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}`
    } else if (dayDifference === 1) {
      return `Yesterday ${messageDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}`
    } else if (dayDifference < 7) {
      return `${messageDate.toLocaleString("en-US", { hour: "numeric", minute: "numeric", weekday: "short" })}`
    } else {
      return messageDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    }
  }

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (user && globChat) {
      const formData = new FormData(e.currentTarget)
      const text = String(formData.get("text")).trim()
      if (text) {
        sendMessage(globChat.id, user.id, text)
      }
      e.currentTarget.reset()
    }
  }

  return (
    <div className="flex h-screen w-screen gap-8 p-8">
      {/* sidebar */}
      <div className="flex min-w-80 flex-col gap-3 px-4">
        <h1 className="pl-1">chats</h1>
        {/* top module */}
        <div className="flex gap-3 pb-2">
          {/* search */}
          <input
            type="text"
            placeholder="search chats"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-secondary w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
          />
          {/* create chat button */}
          <button
            className="bg-secondary rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
            onClick={handleCreateChat}
          >
            <FaPlus />
          </button>
        </div>
        {/* chat list */}
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          {chats &&
            chats
              .filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                // chat
                <Link
                  className={`flex flex-col gap-1 rounded-2xl bg-slate-300 ${chat.id === globChat?.id ? "bg-opacity-70" : "bg-opacity-20 hover:bg-opacity-40"} px-5 py-4 transition-all`}
                  href={`/c/${chat.id}`}
                  key={chat.id}
                >
                  {/* top */}
                  <div className="flex w-full justify-between">
                    <h3>{chat.name}</h3>
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
      {/* chat (left side) */}
      <div className="flex h-full w-full min-w-96 flex-col items-center gap-4">
        {/* messages */}
        <div
          ref={chat}
          className="flex h-full max-h-full w-full flex-col gap-1.5 overflow-y-scroll"
        >
          {messages &&
            messages.map((message, index) => {
              const timestamp = new Date(message.createdAt)
              const oldTimestamp = new Date(messages[index - 1]?.createdAt)

              const conditional =
                (index !== 0 &&
                  Math.abs(timestamp.getTime() - oldTimestamp.getTime()) >=
                    20 * 60 * 1000) ||
                index === 0

              const author = user?.id === message.authorId

              return (
                // message container
                <Fragment key={message.id}>
                  {conditional && (
                    // date separator
                    <p className="flex w-full justify-center py-2 text-xs opacity-80">
                      {formatDateDiff(message.createdAt)}
                    </p>
                  )}
                  {/* message text */}
                  <div className={`${author && "justify-end"} flex w-full`}>
                    <div
                      className={`${author ? "bg-secondary justify-end bg-opacity-90 text-white" : "bg-slate-400 bg-opacity-20 text-opacity-70"} w-max rounded-[19px] px-[18px] py-2.5 shadow-sm`}
                    >
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                </Fragment>
              )
            })}
        </div>
        {/* text input */}
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => handleSendMessage(e)}
        >
          <input
            placeholder={`message ${globChat?.name}`}
            className="focus:ring-secondary w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
            name="text"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-secondary rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Page
