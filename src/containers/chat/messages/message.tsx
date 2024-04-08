import { FC } from "react"

interface MessageProps {
  message: Message
  author: boolean
}

const Message: FC<MessageProps> = ({ message, author }) => {
  return (
    <div className={`${author && "justify-end"} flex w-full`}>
      <div
        className={`${author ? "bg-primary bg-opacity-80" : "bg-neutral bg-opacity-70"} w-max rounded-2xl px-5 py-3 text-text text-opacity-70`}
      >
        <div className="text-lg">{message.text}</div>
      </div>
    </div>
  )
}

export default Message
