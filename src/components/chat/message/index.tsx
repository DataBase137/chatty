"use client"

import { reactMessage, unsendMessageHandler } from "@/actions/chat"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import EmojiPicker from "emoji-picker-react"
import Form from "next/form"
import { FC, useActionState, useRef, useState } from "react"
import { FaRegSmile, FaUndo } from "react-icons/fa"
import { FaEllipsisVertical, FaPen, FaReply } from "react-icons/fa6"

interface MessageProps {
  message: Message
  conditional: boolean
  userId: string
  chat: Chat
  nameNeeded: boolean
  handleEditMessage: (message: Message, onClose: () => void) => void
  handleReply: (message: Message) => void
}

const Reaction: FC<{
  reactions?: Reaction[]
  isAuthor: boolean
  onReactionMenu: () => void
}> = ({ reactions = [], isAuthor, onReactionMenu }) => {
  if (!reactions || reactions.length === 0) return null

  const grouped = reactions.reduce<Record<string, { count: number }>>(
    (acc, r) => {
      acc[r.emoji] = acc[r.emoji] || { count: 0 }
      acc[r.emoji].count++
      return acc
    },
    {}
  )

  return (
    <button
      className={`absolute z-10 ${isAuthor ? "right-1" : "left-1"} -bottom-4 rounded-full transition hover:scale-110`}
      onClick={onReactionMenu}
    >
      <div className="flex items-center rounded-full bg-slate-50/90 px-2 py-0.5 text-xs shadow-sm">
        {Object.entries(grouped).map(([emoji, { count }]) => (
          <div
            key={emoji}
            className="flex items-center gap-1 rounded-full px-1 py-0.5"
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 1 && (
              <span className="text-[10px] font-medium text-slate-600">
                {count}
              </span>
            )}
          </div>
        ))}
      </div>
    </button>
  )
}

const initContextMenu = { show: false, x: 0, y: 0 }

const ReactionMenu: FC<{
  show: boolean
  x: number
  y: number
  onClose: () => void
  onEmojiClick: (emojiData: any) => void
}> = ({ show, x, y, onClose, onEmojiClick }) => {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, onClose)
  if (!show) return null
  return (
    <div
      ref={ref}
      className="absolute z-20 flex w-fit"
      style={{ top: y, left: x }}
    >
      <EmojiPicker
        className="shadow-lg"
        reactionsDefaultOpen={true}
        onEmojiClick={onEmojiClick}
        allowExpandReactions={false}
      />
    </div>
  )
}

const ContextMenu: FC<{
  show: boolean
  x: number
  y: number
  onClose: () => void
  formAction: any
  messageId: string
  chatId: string
  handleEditMessage: () => void
}> = ({
  show,
  x,
  y,
  onClose,
  formAction,
  messageId,
  chatId,
  handleEditMessage,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, onClose)
  if (!show) return null
  return (
    <div
      ref={ref}
      className="absolute z-20 box-border flex w-32 flex-col gap-0.5 rounded-[0.85rem] bg-slate-50 px-1.5 py-1.5 shadow-lg"
      style={{ top: y, left: x }}
    >
      <button
        onClick={handleEditMessage}
        className="flex items-center justify-between gap-2 text-nowrap rounded-b-sm rounded-t-lg px-2.5 py-1.5 hover:bg-slate-200 hover:bg-opacity-50"
      >
        <p className="text-xs">edit</p>
        <FaPen className="text-[0.6rem]" />
      </button>
      <div className="mx-1 flex items-center justify-center py-0.5">
        <div className="h-[1.5px] w-full rounded-2xl bg-slate-300 bg-opacity-60" />
      </div>
      <Form action={formAction} onSubmit={onClose}>
        <input hidden name="message-id" value={messageId} readOnly />
        <input hidden name="chat-id" value={chatId} readOnly />
        <button
          className="flex w-full items-center justify-between gap-2 text-nowrap rounded-b-lg rounded-t-sm px-2.5 py-1.5 hover:bg-red-200 hover:bg-opacity-30"
          type="submit"
        >
          <p className="text-xs">unsend</p>
          <FaUndo className="text-[0.6rem]" />
        </button>
      </Form>
    </div>
  )
}

const MessageActions: FC<{
  isAuthor: boolean
  show: boolean
  messageRef: React.RefObject<HTMLDivElement>
  onReactionMenu: () => void
  onContextMenu: () => void
  onReply: () => void
}> = ({
  isAuthor,
  show,
  messageRef,
  onReactionMenu,
  onContextMenu,
  onReply,
}) =>
  show ? (
    <div
      className={`flex items-center gap-1 ${isAuthor ? "pr-1" : "pl-1"}`}
      style={{
        height: messageRef.current?.clientHeight
          ? `${messageRef.current.clientHeight}px`
          : undefined,
      }}
    >
      {isAuthor && (
        <button
          onClick={onReply}
          className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
        >
          <FaReply className="text-xs" />
        </button>
      )}
      <button
        onClick={onReactionMenu}
        className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
      >
        <FaRegSmile className="text-xs" />
      </button>
      {!isAuthor && (
        <button
          onClick={onReply}
          className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
        >
          <FaReply className="text-xs" />
        </button>
      )}
      {isAuthor && (
        <button
          onClick={onContextMenu}
          className="rounded-2xl p-1.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
        >
          <FaEllipsisVertical className="text-xs" />
        </button>
      )}
    </div>
  ) : null

const Message: FC<MessageProps> = ({
  message,
  conditional,
  userId,
  chat,
  nameNeeded,
  handleEditMessage,
  handleReply,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [reactionMenu, setReactionMenu] = useState(initContextMenu)
  const [contextMenu, setContextMenu] = useState(initContextMenu)
  const isAuthor = userId === message.authorId
  const [state, formAction] = useActionState(unsendMessageHandler, undefined)
  const messageRef = useRef<HTMLDivElement>(null)

  const handleEmojiClick = async (emojiData: any) => {
    await reactMessage(message.id, emojiData.emoji)
    setReactionMenu(initContextMenu)
  }

  const showActions = isHovered || reactionMenu.show || contextMenu.show

  const handleReactionMenu = () => {
    const rect = messageRef.current?.getBoundingClientRect() || new DOMRect()
    let x = isAuthor ? rect.left - 145 : rect.right - 145
    if (x + 314 > window.innerWidth) x = window.innerWidth - 314
    if (x < 0) x = 0
    setReactionMenu({
      show: true,
      x,
      y: rect.top - 53,
    })
  }

  const handleContextMenu = () => {
    const rect = messageRef.current?.getBoundingClientRect() || new DOMRect()
    let x = rect.left - 77.5
    let y = rect.top - 82
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

  const formatTimestamp = (createdAt: Date) => {
    const messageDate = new Date(createdAt)
    const now = new Date()
    const isToday = messageDate.toDateString() === now.toDateString()
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      messageDate.toDateString()
    if (isToday) {
      return messageDate
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
        .toLocaleLowerCase()
    } else if (isYesterday) {
      return `yesterday ${messageDate
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
        .toLocaleLowerCase()}`
    } else if (
      (new Date().getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24) <
      7
    ) {
      return messageDate
        .toLocaleString("en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
        })
        .toLocaleLowerCase()
    } else {
      return messageDate
        .toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
        .toLocaleLowerCase()
    }
  }

  return (
    <>
      <ReactionMenu
        show={reactionMenu.show}
        x={reactionMenu.x}
        y={reactionMenu.y}
        onClose={() => setReactionMenu(initContextMenu)}
        onEmojiClick={handleEmojiClick}
      />

      <ContextMenu
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu(initContextMenu)}
        formAction={formAction}
        messageId={message.id}
        chatId={chat.id}
        handleEditMessage={() =>
          handleEditMessage(message, () => setContextMenu(initContextMenu))
        }
      />

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

      {message.parent && (
        <div
          className={`flex w-full flex-col ${isAuthor ? "items-end" : "mt-2 items-start"}`}
        >
          <p className="ml-1 mr-3 flex items-center gap-2 text-xs opacity-95">
            <FaReply />
            {isAuthor ? "you" : message.author.name} replied to{" "}
            {message.parent.authorId === userId
              ? isAuthor
                ? "yourself"
                : "you"
              : message.parent.authorId === message.authorId
                ? "themself"
                : message.parent.author.name}
          </p>
          <div
            className={`-mb-3 inline-block w-fit max-w-[80%] overflow-hidden break-words rounded-[19px] bg-slate-400 bg-opacity-20 px-[18px] py-2.5 align-top text-sm text-opacity-70 opacity-50 shadow-sm`}
            style={{ wordBreak: "break-word" }}
          >
            {message.parent.text}
          </div>
        </div>
      )}

      <div
        className={`z-10 flex w-full ${isAuthor ? "justify-end" : "justify-start"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isAuthor && (
          <MessageActions
            isAuthor={isAuthor}
            show={showActions}
            messageRef={messageRef}
            onReactionMenu={handleReactionMenu}
            onContextMenu={handleContextMenu}
            onReply={() => handleReply(message)}
          />
        )}

        <div
          ref={messageRef}
          className={`relative inline-block w-fit max-w-[80%] rounded-[19px] bg-light align-top shadow-sm ${message.reactions?.length && "mb-4"}`}
          style={{ wordBreak: "break-word" }}
        >
          <div
            className={`break-words rounded-[19px] px-[18px] py-2.5 ${
              isAuthor
                ? "bg-sunset text-white"
                : "bg-slate-400/20 text-opacity-70"
            }`}
          >
            <div className="text-sm">{message.text}</div>
          </div>

          <Reaction
            reactions={message.reactions}
            isAuthor={isAuthor}
            onReactionMenu={handleReactionMenu}
          />
        </div>

        {!isAuthor && (
          <MessageActions
            isAuthor={isAuthor}
            show={showActions}
            messageRef={messageRef}
            onReactionMenu={handleReactionMenu}
            onContextMenu={handleContextMenu}
            onReply={() => handleReply(message)}
          />
        )}
      </div>
    </>
  )
}

export default Message
