import { createChatHandler, findChat, getUsers } from "@/actions/chat"
import { User } from "@prisma/client"
import { FC, useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { FaXmark } from "react-icons/fa6"
import Form from "next/form"

interface PageProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

const ChatModal: FC<PageProps> = ({ userId, isOpen, onClose }) => {
  const [search, setSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [groupExists, setGroupExists] = useState(false)
  const [state, formAction] = useActionState(createChatHandler, undefined)
  const { pending } = useFormStatus()

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    if (selectedUsers.length < 1) {
      setGroupExists(true)
      return
    }

    const updatedUsers = [...selectedUsers, userId]

    findChat(updatedUsers).then((chat) => {
      setGroupExists(!!chat)
    })
  }, [selectedUsers, userId])

  useEffect(() => {
    if (isOpen) {
      setSearch("")
      setSelectedUsers([])
      setGroupName("")
    }
  }, [isOpen])

  useEffect(() => {
    let ignore = false

    getUsers(search).then((users) => {
      if (ignore) return
      users.map((user) => {
        if (user.id != userId) {
          setUsers((prev) => {
            if (prev.includes(user)) return prev
            return [...prev, user]
          })
        }
      })
    })

    return () => {
      ignore = true
    }
  }, [search, userId])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-950/30" onClick={onClose}></div>

      <div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2>create a new chat</h2>

          <button onClick={onClose} className="text-dark hover:text-opacity-80">
            <FaXmark className="text-xl" />
          </button>
        </div>

        <Form className="flex flex-col" action={formAction} onSubmit={onClose}>
          <input
            type="text"
            name="name"
            placeholder="group name (optional)"
            value={groupName}
            disabled={groupExists || selectedUsers.length < 2}
            onChange={(e) => setGroupName(e.target.value)}
            className="input mb-3 disabled:cursor-not-allowed disabled:bg-red-50"
          />

          <input
            type="text"
            placeholder="search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input mb-3"
          />

          <input
            hidden
            readOnly
            name="users"
            value={[...selectedUsers, userId]}
          />

          <div className="mb-4 max-h-40 overflow-y-auto">
            {[
              ...new Map(
                users
                  .filter((u) => u.id !== userId)
                  .filter((u) => u.name.includes(search))
                  .map((user) => [user.id, user])
              ).values(),
            ].map((user) => (
              <label
                key={user.id}
                className="mb-2 flex cursor-pointer items-center rounded-lg p-2 hover:bg-sunset hover:bg-opacity-10"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="peer hidden"
                />
                <div className="duration-10 mr-3 h-5 w-5 rounded-full border-2 border-sunset transition-colors peer-checked:bg-sunset peer-checked:bg-opacity-90" />
                <span className="text-sm">{user.name}</span>
              </label>
            ))}
            <div className="flex w-full justify-center">
              <button
                disabled={groupExists || pending}
                type="submit"
                className="w-1/2 rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:cursor-pointer disabled:bg-opacity-50"
              >
                create chat
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default ChatModal
