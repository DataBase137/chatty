"use client"

import { createChat, editMessage, findChat, sendMessage } from "@/actions/chat"
import Message from "@/components/chat/message"
import { formatChatName } from "@/hooks/formatChatName"
import { User } from "@prisma/client"
import Link from "next/link"
import { FC, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaPaperPlane, FaPlus } from "react-icons/fa6"
import Form from "next/form"
import { usePathname, useRouter } from "next/navigation"
import { usePusher } from "@/hooks/usePusher"

interface MessagesProps {
  initChat: Chat
  user: User
  initMessages: Message[]
  friends: Friend[]
}

const NewChatInput: FC<{
  friends: Friend[]
  user: User
  setChat: (chat: Chat) => void
}> = ({ friends, user, setChat }) => {
  const chatInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Friend[]>([])
  const [suggestions, setSuggestions] = useState<Friend[]>([])
  const [groupExists, setGroupExists] = useState(false)
  const [focus, setFocus] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    setSuggestions(
      value.length
        ? friends.filter(
            (f) =>
              f.name.toLowerCase().includes(value.toLowerCase()) &&
              !selected.some((s) => s.id === f.id)
          )
        : []
    )
  }

  const handleSelect = (friend: Friend) => {
    setSelected([...selected, friend])
    setSearch("")
    setSuggestions([])
    chatInputRef.current?.focus()
  }

  const handleRemove = (id: string) => {
    setSelected(selected.filter((f) => f.id !== id))
  }

  const handleSubmit = () => {
    if (!selected.length) return
    createChat(
      selected.map((f) => f.id),
      user.id
    ).then((chat) => router.push(`/c/${chat?.id}`))
  }

  useEffect(() => {
    setChat({
      isGroup: true,
      id: "new",
      name: "new message",
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messages: [],
      participants: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      ],
    } as Chat)

    if (!selected.length) {
      setGroupExists(true)
      return
    }

    const updatedUsers = [...selected.map((s) => s.id), user.id]

    findChat(updatedUsers).then((chat) => {
      setGroupExists(!!chat)
      if (chat) setChat(chat)
    })
  }, [user, selected, setChat])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !search && selected.length)
      handleRemove(selected[selected.length - 1].id)
    if (e.key === "Escape") chatInputRef.current?.blur()
    if (e.key === "Enter" && suggestions[0]) handleSelect(suggestions[0])
  }

  return (
    <Form action={handleSubmit} className="flex w-full gap-2">
      <div
        className={`flex w-full min-w-56 flex-1 flex-wrap items-center gap-1 rounded-[1.5rem] bg-slate-300/20 px-5 py-1 text-sm text-opacity-70 transition-all ${focus && "ring-2 ring-sunset"}`}
      >
        {selected.map((friend) => (
          <span key={friend.id}>{friend.name},</span>
        ))}
        <input
          value={search}
          type="text"
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length ? "" : "add friends to create chat"}
          className="min-w-[120px] flex-1 border-none bg-transparent py-2 text-sm focus:outline-none"
          ref={chatInputRef}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-30 mt-12 box-border flex w-1/2 flex-col gap-1 rounded-[0.85rem] bg-slate-50 px-2 py-2 shadow-lg">
          {suggestions.map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => handleSelect(friend)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-200/50"
            >
              <span className="text-sm">{friend.name}</span>
              <span className="text-xs opacity-80">{friend.email}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={groupExists}
        className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition hover:bg-opacity-70 disabled:opacity-50 disabled:hover:bg-opacity-90"
      >
        <FaPlus />
      </button>
    </Form>
  )
}

const Messages: FC<MessagesProps> = ({
  initChat,
  user,
  initMessages,
  friends,
}) => {
  const chatRef = useRef<HTMLDivElement>(null)
  const [chat, setChat] = useState<Chat>(initChat)
  const [messages, setMessages] = useState<Message[]>(initMessages)
  const [edit, setEdit] = useState<{ message: Message; text: string } | null>(
    null
  )
  const [reply, setReply] = useState<Message | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isNew = pathname === "/c/new"

  const { subscribe } = usePusher()

  useEffect(() => {
    subscribe(`chat-${chat.id}`, "new-message", (data: { message: Message }) =>
      setMessages((prev) => [...prev, data.message])
    )

    subscribe(
      `chat-${chat.id}`,
      "react-message",
      (data: { message: Message }) =>
        setMessages((prev) =>
          prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
        )
    )

    subscribe(
      `chat-${chat.id}`,
      "unsend-message",
      (data: { messageId: string }) =>
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
    )

    subscribe(`chat-${chat.id}`, "edit-message", (data: { message: Message }) =>
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
      )
    )
  }, [chat.id, subscribe])

  useEffect(() => {
    if (isNew) {
      fetch(`/api/messages/${chat.id}`)
        .then((res) => res.json())
        .then(setMessages)
    }
  }, [chat, isNew])

  useEffect(() => {
    const chatDiv = chatRef.current
    if (!chatDiv) return

    const handleResize = () => {
      chatDiv.scrollTop = chatDiv.scrollHeight
    }
    handleResize()

    const resizeObserver = new window.ResizeObserver(handleResize)
    resizeObserver.observe(chatDiv)
    return () => resizeObserver.disconnect()
  }, [messages])

  const handleEditMessage = async (msg: Message, onClose: () => void) => {
    setEdit({ message: msg, text: msg.text })
    onClose()
    await inputRef.current?.focus()
    inputRef.current?.setSelectionRange(msg.text.length, msg.text.length)
  }

  const handleReply = (message: Message) => {
    setReply(message)
    inputRef.current?.focus()
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className={`flex w-full items-center ${isNew ? "" : "justify-between"} px-4 pb-1`}
      >
        <Link
          className="ml-[-2rem] rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
          href="/c"
        >
          <FaArrowLeft />
        </Link>
        {isNew ? (
          <NewChatInput friends={friends} user={user} setChat={setChat} />
        ) : (
          <>
            <h2 className="text-2xl font-semibold">
              {formatChatName(chat, user.id || "")}
            </h2>
            <p className="text-sm text-slate-600">
              {chat.isGroup &&
                chat.name === formatChatName(chat, user?.id || "") &&
                chat.participants
                  .filter((p) => p.id !== user.id)
                  .map((p) => p.name)
                  .join(", ")}
            </p>
          </>
        )}
      </div>

      <div
        ref={chatRef}
        className="flex h-full max-h-full w-full flex-col gap-1.5 overflow-y-scroll"
      >
        {messages.map((message, index) => {
          const timestamp = new Date(message.createdAt)
          const oldTimestamp = new Date(messages[index - 1]?.createdAt)
          const showTimestamp =
            index === 0 ||
            (index !== 0 &&
              Math.abs(timestamp.getTime() - oldTimestamp.getTime()) >=
                20 * 60 * 1000)
          const showName = messages[index - 1]?.authorId !== message.authorId

          return (
            <Message
              key={message.id}
              message={message}
              conditional={showTimestamp}
              userId={user.id}
              chat={chat}
              nameNeeded={showName}
              handleEditMessage={handleEditMessage}
              handleReply={handleReply}
            />
          )
        })}
      </div>

      <Form
        className="flex w-full flex-col"
        action={
          edit
            ? (e) => {
                editMessage(e)
                setEdit(null)
              }
            : chat.id === "new"
              ? () => {}
              : (e) => {
                  sendMessage(e)
                  if (isNew) router.push(chat.id)
                  setReply(null)
                }
        }
        onSubmit={(e) => {
          if (chat.id === "new") e.preventDefault()
        }}
      >
        {edit && (
          <div className="relative h-8">
            <label
              htmlFor="message-input"
              className="absolute w-11/12 rounded-3xl bg-sunset px-5 pb-[48px] pt-2 text-white"
            >
              <h4 className="text-sm">editing message</h4>
            </label>
          </div>
        )}
        {reply && (
          <div className="relative h-8">
            <label
              htmlFor="message-input"
              className="absolute w-11/12 rounded-3xl bg-sunset px-5 pb-[48px] pt-2 text-white"
            >
              <h4 className="text-sm">
                replying to{" "}
                {reply.authorId === user.id ? "yourself" : reply.author.name}
              </h4>
            </label>
          </div>
        )}
        <div className="flex w-full gap-2">
          <div className="z-10 w-full rounded-full bg-light">
            <input
              placeholder={
                edit
                  ? "type to edit message"
                  : chat.id === "new"
                    ? "create chat to send message"
                    : `message ${formatChatName(chat, user.id)}`
              }
              type="text"
              className="input w-full bg-slate-300 bg-opacity-20"
              name="text"
              autoComplete="off"
              defaultValue={edit?.text || ""}
              onChange={(e) =>
                edit && setEdit({ ...edit, text: e.target.value })
              }
              onFocus={() => {
                const handleKeyDown = (e: KeyboardEvent) => {
                  if (e.key === "Escape") {
                    setEdit(null)
                    inputRef.current?.blur()
                  }
                }
                window.addEventListener("keydown", handleKeyDown)
                return () => {
                  window.removeEventListener("keydown", handleKeyDown)
                }
              }}
              onBlur={() => {
                edit && setEdit(null)
                reply && setReply(null)
              }}
              ref={inputRef}
            />
          </div>
          {edit && (
            <input
              type="hidden"
              name="message-id"
              value={edit.message.id}
              readOnly
            />
          )}
          {reply && (
            <input type="hidden" name="reply-id" value={reply?.id} readOnly />
          )}
          <input hidden name="chat-id" value={chat.id} readOnly />
          <input hidden name="user-id" value={user.id} readOnly />
          <button
            type="submit"
            className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
          >
            <FaPaperPlane />
          </button>
        </div>
      </Form>
    </div>
  )
}

export default Messages
