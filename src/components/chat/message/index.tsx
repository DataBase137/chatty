import { FC } from "react"

interface MessageProps {
  message: Message
  conditional: boolean
  author: boolean
  chat: Chat
  nameNeeded: boolean
}

const Message: FC<MessageProps> = ({
  message,
  conditional,
  author,
  chat,
  nameNeeded,
}) => {
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

  return (
    <>
      {conditional && (
        <p className="flex w-full justify-center py-2 text-xs font-light opacity-80">
          {formatDateDiff(message.createdAt)}
        </p>
      )}
      {!author && (nameNeeded || conditional) && chat.isGroup && (
        <p className="flex h-full flex-col justify-center pl-3 text-xs font-light opacity-80">
          {message.author.name}
        </p>
      )}
      <div className={`${author && "justify-end"} flex w-full`}>
        <div
          className={`${author ? "bg-sunset justify-end bg-opacity-90 text-white" : "bg-slate-400 bg-opacity-20 text-opacity-70"} w-max max-w-[80%] rounded-[19px] px-[18px] py-2.5 shadow-sm`}
        >
          <div className="text-sm">{message.text}</div>
        </div>
      </div>
    </>
  )
}

export default Message
