"use client"

import { FC, Fragment, useState, useEffect, useRef, useCallback } from "react"
import Pusher from "pusher-js"
import { User } from "@prisma/client"
import { getMessages, sendMessage } from "@/actions/chat"
import { FaPaperPlane } from "react-icons/fa6"

interface MessagesProps {
  user: User
  chatId: string
  chatName: string
}

const Messages: FC<MessagesProps> = ({ user, chatId, chatName }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const chat = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const messages = await getMessages(chatId)

    setMessages(messages || [])
  }, [chatId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

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

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`chat-${chatId}`)

    channel.bind("new-message", (data: any) => {
      const message: Message = JSON.parse(data.message)

      setMessages((messages) => [...(messages || []), message])
    })

    return () => {
      pusher.unsubscribe(`chat-${chatId}`)
    }
  }, [chatId])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = String(formData.get("text")).trim()

    if (text) {
      sendMessage(chatId, user.id, text)
    }

    e.currentTarget.reset()
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 pl-8">
      <div
        ref={chat}
        className="flex h-full max-h-full w-full flex-col gap-4 overflow-y-auto"
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

            return (
              <Fragment key={message.id}>
                {conditional && (
                  <p className="flex w-full justify-center text-xs opacity-80">
                    {formatDateDiff(message.createdAt)}
                  </p>
                )}
                <div className={`${author && "justify-end"} flex w-full`}>
                  <div
                    className={`${author ? "bg-primary bg-opacity-80" : "bg-neutral bg-opacity-70"} w-max rounded-2xl px-5 py-3 text-text text-opacity-70`}
                  >
                    <div className="text-lg">{message.text}</div>
                  </div>
                </div>
              </Fragment>
            )
          })}
      </div>
      <form className="flex gap-2" onSubmit={(e) => handleSendMessage(e)}>
        <input
          placeholder={`message ${chatName}`}
          name="text"
          className="h-12 w-[768px] rounded-xl bg-neutral bg-opacity-80 px-5 text-base text-text outline-0 hover:bg-text hover:bg-opacity-[0.08] focus:bg-text focus:bg-opacity-10"
          autoComplete="off"
        />
        <button type="submit" className="button">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default Messages
