"use client"

import { FC, MouseEvent, useState } from "react"
import { FaRegSmile } from "react-icons/fa"
import { FaEllipsisVertical } from "react-icons/fa6"

interface MessageProps {
  message: Message
  conditional: boolean
  isAuthor: boolean
  chat: Chat
  nameNeeded: boolean
  handleContextMenu: (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => void
}

const Message: FC<MessageProps> = ({
  message,
  conditional,
  isAuthor,
  chat,
  nameNeeded,
  handleContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const formatTimestamp = (createdAt: Date) => {
    const messageDate = new Date(createdAt)
    const now = new Date()

    const isToday = messageDate.toDateString() === now.toDateString()
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      messageDate.toDateString()

    if (isToday) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
    } else if (isYesterday) {
      return `Yesterday ${messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`
    } else if (
      (new Date().getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24) <
      7
    ) {
      return messageDate.toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
      })
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

  return (
    <>
      {conditional && (
        <p className="flex w-full justify-center py-2 text-xs font-light text-slate-500">
          {formatTimestamp(message.createdAt)}
        </p>
      )}

      {!isAuthor && chat.isGroup && (nameNeeded || conditional) && (
        <p className="ml-3 mt-1 text-xs font-light text-slate-500">
          {message.author.name}
        </p>
      )}

      <div
        className={`flex w-full ${isAuthor ? "justify-end" : "justify-start"} items-center`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        {isHovered && isAuthor && (
          <div className="pr-1">
            <button className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40">
              <FaEllipsisVertical className="text-xs" />
            </button>
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-[19px] px-[18px] py-2.5 text-sm shadow-sm ${
            isAuthor
              ? "bg-sunset text-white"
              : "bg-slate-400 bg-opacity-20 text-opacity-70"
          }`}
        >
          {message.text}
        </div>

        {isHovered && !isAuthor && (
          <>
            <div className="pl-1">
              <button className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40">
                <FaRegSmile className="text-xs" />
              </button>
            </div>
            <div className="pl-1">
              <button className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40">
                <FaEllipsisVertical className="text-xs" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Message
