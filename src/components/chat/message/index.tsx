import { FC } from "react"

interface MessageProps {
  message: Message
  conditional: boolean
  isAuthor: boolean
  chat: Chat
  nameNeeded: boolean
}

const Message: FC<MessageProps> = ({
  message,
  conditional,
  isAuthor,
  chat,
  nameNeeded,
}) => {
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
        className={`flex w-full ${isAuthor ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[80%] rounded-[19px] px-[18px] py-2.5 text-sm shadow-sm ${
            isAuthor
              ? "bg-sunset text-white"
              : "bg-slate-400 bg-opacity-20 text-opacity-70"
          }`}
        >
          {message.text}
        </div>
      </div>
    </>
  )
}

export default Message
