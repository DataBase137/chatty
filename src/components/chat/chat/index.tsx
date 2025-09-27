"use client"

import { deleteChat, leaveChat, renameChat } from "@/actions/chat"
import { formatChatName } from "@/hooks/formatChatName"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { User } from "@prisma/client"
import Form from "next/form"
import Link from "next/link"
import { FC, useEffect, useRef, useState } from "react"
import {
  FaEllipsisVertical,
  FaPen,
  FaRightFromBracket,
  FaTrashCan,
  FaUserPlus,
} from "react-icons/fa6"

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
  globChatId: string | null
  user: User
}

const initContextMenu = { show: false, x: 0, y: 0 }

const ContextMenu: FC<{
  show: boolean
  x: number
  y: number
  onClose: () => void
  userId: string
  chat: Chat
  handleRename: () => void
}> = ({ show, x, y, onClose, userId, chat, handleRename }) => {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, onClose)
  const leave = chat.participants.length > 3

  const formAction = () => {
    if (leave) leaveChat(userId, chat.id)
    else deleteChat(chat.id)
  }

  if (!show) return null
  return (
    <div
      ref={ref}
      className="absolute z-20 box-border flex w-40 flex-col gap-0.5 rounded-2xl bg-slate-50 p-2 shadow-lg"
      style={{ top: y, left: x }}
    >
      <button
        onClick={() => {
          handleRename()
          onClose()
        }}
        className="flex items-center justify-between gap-2 text-nowrap rounded-b-md rounded-t-lg px-2.5 py-1.5 hover:bg-slate-200 hover:bg-opacity-50"
      >
        <p className="text-xs">rename</p>
        <FaPen className="text-[0.6rem]" />
      </button>
      <button
        onClick={() => {
          onClose()
        }}
        className="flex items-center justify-between gap-2 text-nowrap rounded-b-md rounded-t-lg px-2.5 py-1.5 hover:bg-slate-200 hover:bg-opacity-50"
      >
        <p className="text-xs">add user</p>
        <FaUserPlus className="text-[0.6rem]" />
      </button>
      <div className="mx-1 flex items-center justify-center py-0.5">
        <div className="h-[1.5px] w-full rounded-2xl bg-slate-300 bg-opacity-60" />
      </div>
      <Form action={formAction} onSubmit={onClose}>
        <input hidden name="chat-id" value={chat.id} readOnly />
        <button
          className="flex w-full items-center justify-between gap-2 text-nowrap rounded-b-lg rounded-t-md px-2.5 py-1.5 hover:bg-red-200 hover:bg-opacity-30"
          type="submit"
        >
          <p className="text-xs">{leave ? "leave chat" : "remove chat"}</p>
          {leave ? (
            <FaRightFromBracket className="text-[0.6rem]" />
          ) : (
            <FaTrashCan className="text-[0.6rem]" />
          )}
        </button>
      </Form>
    </div>
  )
}

const Chat: FC<ChatProps> = ({ chat, globChatId, user }) => {
  const chatName = formatChatName(chat, user.id || "")
  const [hover, setHover] = useState(false)
  const [contextMenu, setContextMenu] = useState(initContextMenu)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [rename, setRename] = useState<{ text: string } | null>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  const handleContextMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect() || new DOMRect()
    let x = rect.left - 63
    let y = rect.top - 115.5
    if (x + 150 > window.innerWidth) x = window.innerWidth - 150
    if (x < 0) x = 0
    if (y + 100.5 > window.innerHeight) y = window.innerHeight - 100.5
    if (y < 0) y = 0
    setContextMenu({
      show: true,
      x,
      y,
    })
  }

  const handleRename = async () => {
    await setRename({ text: chat.name || "" })
    await renameRef.current?.focus()
    renameRef.current?.setSelectionRange(
      renameRef.current.value.length,
      renameRef.current.value.length
    )
  }

  const latestMessage = chat.messages?.length
    ? `${
        chat.messages[0].author.name === user.name
          ? "you"
          : chat.messages[0].author.name
      }: ${chat.messages[0].text}`
    : "send a message"

  return (
    <>
      <ContextMenu
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu(initContextMenu)}
        userId={user.id}
        chat={chat}
        handleRename={handleRename}
      />

      <div
        className="relative"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link
          className={`flex flex-col gap-1 rounded-2xl bg-slate-300 shadow-sm ${
            chat.id === globChatId
              ? "bg-opacity-70"
              : hover
                ? "bg-opacity-40"
                : "bg-opacity-20"
          } px-5 py-4 transition-all`}
          href={`/c/${chat.id}`}
          key={chat.id}
        >
          <div className="flex w-full justify-between">
            {rename ? (
              <Form
                action={(e) => {
                  renameChat(e, chat.id)
                  setRename(null)
                }}
              >
                <input
                  className="h-7 text-nowrap bg-transparent text-[0.95rem] font-semibold outline-none"
                  value={rename.text}
                  placeholder="rename chat"
                  type="text"
                  name="name"
                  onChange={(e) => setRename({ text: e.currentTarget.value })}
                  ref={renameRef}
                  onBlur={() => setRename(null)}
                  onKeyDown={(e) => e.key === "Escape" && setRename(null)}
                />
              </Form>
            ) : (
              <h3 className="text-nowrap text-[0.95rem] font-semibold">
                {chatName.slice(0, 29)}
                {chatName.length >= 29 && "..."}
              </h3>
            )}

            <DateFormat
              className="text-xs font-light"
              date={new Date(chat.lastMessageAt)}
            />
          </div>

          <p className="text-nowrap text-xs text-slate-600">
            {latestMessage.slice(0, 36)}
            {latestMessage.length >= 36 && "..."}
          </p>
        </Link>

        {(hover || contextMenu.show) && chat.isGroup && (
          <button
            className={`absolute right-4 top-8 z-10 rounded-2xl p-2 transition hover:bg-slate-300 ${chat.id === globChatId ? "bg-opacity-60" : "hover:bg-opacity-50"}`}
            onClick={(e) => {
              e.preventDefault()
              handleContextMenu()
            }}
            ref={btnRef}
          >
            <FaEllipsisVertical className="text-xs" />
          </button>
        )}
      </div>
    </>
  )
}

export default Chat
