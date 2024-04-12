import { FC } from "react"
import { DateFormat } from "../components"
import Link from "next/link"

interface ChatProps {
  chat: Chat
  selected: boolean
  you: boolean | null
  userId: string
}

const Chat: FC<ChatProps> = ({ you, chat, selected, userId }) => {
  return (
    <Link
      href={`/c/${chat.id}`}
      className={`${selected ? "bg-text bg-opacity-15" : "bg-neutral bg-opacity-80"} flex w-full flex-col justify-center gap-[6px] rounded-xl px-5 py-[18px] text-text text-opacity-60 hover:bg-text hover:bg-opacity-10`}
    >
      <div className="flex w-full justify-between">
        <h3 className="text-xl font-medium">
          {chat.name && !chat.isGroup
            ? chat.participants.filter(
                (participant) => participant.id !== userId
              )[0].name
            : chat.name}
        </h3>
        <DateFormat date={chat.lastMessageAt} />
      </div>
      <p>{`${chat.messages?.length ? `${you ? "you" : chat.messages?.[0]?.author.name}: ${chat.messages[0].text ? `${chat.messages[0].text.slice(0, 24)}${chat.messages[0].text.length >= 24 ? "..." : ""}` : "image"}` : "send a message"}`}</p>
    </Link>
  )
}

export default Chat
