"use client"

import { sendMessage } from "@/actions/chat"
import Message from "@/components/chat/message"
import { formatChatName } from "@/hooks/formatChatName"
import { User } from "@prisma/client"
import Link from "next/link"
import Pusher from "pusher-js"
import { FC, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa6"
import Form from "next/form"

interface MessagesProps {
  chat: Chat
  user: User
  initMessages: Message[]
}

const Messages: FC<MessagesProps> = ({ chat, user, initMessages }) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(initMessages)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`chat-${chat.id}`)

    channel.bind("new-message", (data: { message: Message }) => {
      const message = data.message

      setMessages((prev) => [...prev, message])
    })

    channel.bind("react-message", (data: { message: Message }) => {
      const updatedMessage = data.message

      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      )
    })

    channel.bind("unsend-message", (data: { messageId: string }) => {
      const { messageId } = data

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`chat-${chat.id}`)
    }
  }, [chat])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between px-4 pb-1">
        <Link
          className="ml-[-2rem] rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
          href="/c"
        >
          <FaArrowLeft />
        </Link>
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

      <div
        ref={chatRef}
        className="flex h-full max-h-full w-full flex-col gap-1.5 overflow-y-scroll"
      >
        {messages.map((message, index) => {
          const timestamp = new Date(message.createdAt)
          const oldTimestamp = new Date(messages[index - 1]?.createdAt)

          const conditional =
            (index !== 0 &&
              Math.abs(timestamp.getTime() - oldTimestamp.getTime()) >=
                20 * 60 * 1000) ||
            index === 0

          const nameNeeded = messages[index - 1]?.authorId !== message.authorId

          return (
            <Message
              key={message.id}
              message={message}
              conditional={conditional}
              userId={user.id}
              chat={chat}
              nameNeeded={nameNeeded}
            />
          )
        })}
      </div>

      <Form className="flex w-full gap-2" action={sendMessage}>
        <input
          placeholder={`message ${formatChatName(chat, user.id || "")}`}
          type="text"
          className="input"
          name="text"
          autoComplete="off"
        />
        <input hidden name="chat-id" value={chat.id} readOnly />
        <input hidden name="user-id" value={user.id} readOnly />
        <button
          type="submit"
          className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
        >
          <FaPaperPlane />
        </button>
      </Form>
    </div>
  )
}

export default Messages
