"use client"

import { FC, Fragment, useState, useEffect, useCallback, useRef } from "react"
import { getMessages } from "@/actions/chat"
import { User } from "@prisma/client"
import Message from "./message"
import { Input } from "../components"
import Pusher from "pusher-js"

interface MessagesProps {
  user: User
  chatId?: string
  chatName?: string
}

const Messages: FC<MessagesProps> = ({ user, chatId, chatName }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const chat = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const messages = await getMessages(chatId)

    if (messages) setMessages(messages)
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
  }, [chatId, messages])

  return (
    <>
      {chatId && chatName ? (
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

                return (
                  <Fragment key={message.id}>
                    {conditional && (
                      <p className="flex w-full justify-center text-xs opacity-80">
                        {formatDateDiff(message.createdAt)}
                      </p>
                    )}
                    <Message
                      message={message}
                      author={user.id === message.authorId}
                    />
                  </Fragment>
                )
              })}
          </div>
          <Input
            placeholder={`message ${chatName}`}
            chatId={chatId}
            userId={user.id}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-text text-opacity-60">
            select a chat to start messaging
          </p>
        </div>
      )}
    </>
  )
}

export default Messages
