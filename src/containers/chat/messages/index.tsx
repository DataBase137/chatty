"use client"

import { sendMessage } from "@/actions/chat"
import Message from "@/components/chat/message"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js"
import { FC, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa6"

interface MessagesProps {
  chat: Chat
  user: User
  initMessages: Message[]
}

const Messages: FC<MessagesProps> = ({ chat, user, initMessages }) => {
  const router = useRouter()
  const chatRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(initMessages)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`chat-${chat?.id}`)

    channel.bind("new-message", (data: any) => {
      const message: Message = JSON.parse(data.message)

      setMessages((messages) => [...(messages || []), message])
    })

    return () => {
      pusher.unsubscribe(`chat-${chat.id}`)
    }
  }, [chat])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const formatChatName = (chat: Chat, userId: string) => {
    if (chat.name && chat.isGroup) {
      return chat.name
    }
    return chat.participants
      .filter((participant) => participant.id !== userId)
      .map((participant) => participant.name)
      .join(", ")
  }

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (user && chat) {
      const formData = new FormData(e.currentTarget)
      const text = String(formData.get("text")).trim()
      if (text) {
        sendMessage(chat.id, user.id, text)
      }
      e.currentTarget.reset()
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* top module */}
      <div className="flex w-full items-center justify-between px-4 py-1">
        <button
          className="ml-[-2rem] rounded-2xl p-2.5 text-sm hover:bg-slate-300 hover:bg-opacity-40"
          onClick={() => router.push("/c")}
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-semibold">
          {formatChatName(chat, user.id || "")}
        </h2>
        <p className="text-sm text-slate-600">
          {chat.isGroup &&
            chat.name === formatChatName(chat, user?.id || "") &&
            `${chat.participants
              .filter((p) => p.id !== user.id)
              .map((p) => p.name)
              .join(", ")}`}
        </p>
      </div>
      {/* messages */}
      <div
        ref={chatRef}
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

            const author = user.id === message.authorId
            const nameNeeded =
              messages[index - 1]?.authorId !== message.authorId

            return (
              <Message
                key={message.id}
                message={message}
                conditional={conditional}
                author={author}
                chat={chat}
                nameNeeded={nameNeeded}
              />
            )
          })}
      </div>
      {/* text input */}
      <form
        className="flex w-full gap-2"
        onSubmit={(e) => handleSendMessage(e)}
      >
        <input
          placeholder={`message ${formatChatName(chat, user.id || "")}`}
          type="text"
          className="focus:ring-sunset w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
          name="text"
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-sunset rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default Messages
