"use client"

import { createChat, editMessage, findChat, sendMessage } from "@/actions/chat"
import Message from "@/components/chat/message"
import { formatChatName } from "@/hooks/formatChatName"
import { User } from "@prisma/client"
import Link from "next/link"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaPaperPlane, FaPlus } from "react-icons/fa6"
import Form from "next/form"
import { usePathname, useRouter } from "next/navigation"
import { usePusher } from "@/hooks/usePusher"
import { FaRegSmile } from "react-icons/fa"
import EmojiPicker from "emoji-picker-react"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"

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
  const submitBtn = useRef<HTMLButtonElement>(null)
  const [chatName, setChatName] = useState(formatChatName(chat, user.id))
  const [emoji, setEmoji] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(emojiRef, () => setEmoji(false))

  const { subscribe } = usePusher()

  const updateChat = useCallback(
    (chat: Chat) => {
      setChat(chat)
      setChatName(formatChatName(chat, user.id))
    },
    [user.id]
  )

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

    subscribe(`chat-${chat.id}`, "rename-chat", (data: { chat: Chat }) =>
      updateChat(data.chat)
    )

    subscribe(`chat-${chat.id}`, "leave-chat", (data: { chat: Chat }) =>
      updateChat(data.chat)
    )

    subscribe(`chat-${chat.id}`, "add-user", (data: { chat: Chat }) =>
      updateChat(data.chat)
    )
  }, [chat.id, subscribe, updateChat])

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

  const formAction = (e: FormData) => {
    if (edit) {
      editMessage(e)
      setEdit(null)
    } else if (chat.id !== "new") {
      sendMessage(e)
      if (isNew) router.push(chat.id)
      setReply(null)
    }
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
            <h2 className="text-2xl font-semibold">{chatName}</h2>
            <p className="text-sm text-slate-600">
              {chat.isGroup &&
                chat.name === chatName &&
                `${chat.participants.length} users`}
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
        action={formAction}
        onSubmit={(e) => {
          if (chat.id === "new") e.preventDefault()
        }}
        onBlur={(e) => {
          if (e.relatedTarget != submitBtn.current) {
            setEdit(null)
            setReply(null)
          }
        }}
      >
        <div className="flex w-full flex-col">
          <div className="relative w-full">
            {edit && (
              <div className="mb-2 rounded-2xl bg-sunset/95 px-4 py-2 text-xs text-white shadow-sm">
                editing message
              </div>
            )}

            {reply && (
              <div className="mb-2 rounded-2xl bg-sunset/95 px-3 py-2 text-xs text-white shadow-sm">
                replying to{" "}
                <span className="font-semibold">
                  {reply.authorId === user.id ? "yourself" : reply.author.name}
                </span>
              </div>
            )}
            <div className="flex w-full justify-end">
              {emoji && (
                <div className="relative bottom-2" ref={emojiRef}>
                  <EmojiPicker
                    className="shadow-lg"
                    onEmojiClick={async (e) => {
                      setEmoji(false)
                      if (inputRef.current) {
                        inputRef.current.value += e.emoji
                        await inputRef.current.focus()
                        inputRef.current.setSelectionRange(
                          inputRef.current.value.length,
                          inputRef.current.value.length
                        )
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex w-full items-center gap-2">
              <input
                placeholder={
                  edit
                    ? "type to edit message"
                    : chat.id === "new"
                      ? "create chat to send message"
                      : `message ${chatName}`
                }
                type="text"
                className="input flex-1"
                name="text"
                autoComplete="off"
                maxLength={500}
                defaultValue={edit?.text || ""}
                onChange={(e) =>
                  edit && setEdit({ ...edit, text: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setReply(null)
                    setEdit(null)
                  }
                }}
                ref={inputRef}
              />
              <div className="relative -left-12 w-0">
                <button
                  type="button"
                  onClick={() => setEmoji(true)}
                  className={`rounded-2xl p-2.5 text-sm transition hover:bg-slate-300/50 ${emoji && "bg-slate-300/50"}`}
                >
                  <FaRegSmile />
                </button>
              </div>
              <button
                ref={submitBtn}
                type="submit"
                className="rounded-full bg-sunset bg-opacity-90 px-5 py-[15px] text-sm text-white shadow-md transition-all hover:bg-opacity-70"
              >
                <FaPaperPlane />
              </button>
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
          </div>
        </div>
      </Form>
    </div>
  )
}

export default Messages
