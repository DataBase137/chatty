import { User } from "@prisma/client"
import { FC, useEffect, useRef, useState } from "react"
import { FaPlus, FaXmark } from "react-icons/fa6"
import Form from "next/form"
import { addUsers } from "@/actions/chat"

interface PageProps {
  onClose: () => void
  initFriends: Friend[]
  chat: Chat
}

const ChatModal: FC<PageProps> = ({ onClose, initFriends, chat }) => {
  const [friends, setFriends] = useState(initFriends)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Friend[]>([])
  const [suggestions, setSuggestions] = useState<Friend[]>([])
  const [disabled, setDisabled] = useState(true)
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
    addUsers(
      chat.id,
      selected.map((f) => f.id)
    ).then(() => onClose())
  }

  useEffect(() => {
    if (selected.length) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [selected])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !search && selected.length)
      handleRemove(selected[selected.length - 1].id)
    if (e.key === "Escape") chatInputRef.current?.blur()
    if (e.key === "Enter" && suggestions[0]) handleSelect(suggestions[0])
  }

  useEffect(() => {
    setFriends((prev) =>
      prev.filter((f) => !chat.participants.some((p) => p.id === f.id))
    )
  }, [chat.participants])

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    })

    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          onClose()
        }
      })
    }
  }, [onClose])

  if (!chat) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-950/30" onClick={onClose}></div>

      <div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl bg-light p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2>add users to {chat.name}</h2>

          <button
            className="rounded-2xl p-2.5 transition hover:bg-slate-300 hover:bg-opacity-40"
            onClick={onClose}
          >
            <FaXmark />
          </button>
        </div>
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
              placeholder={selected.length ? "" : "search friends"}
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
            disabled={disabled}
            className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition hover:bg-opacity-70 disabled:opacity-50 disabled:hover:bg-opacity-90"
          >
            <FaPlus />
          </button>
        </Form>{" "}
      </div>
    </div>
  )
}

export default ChatModal
