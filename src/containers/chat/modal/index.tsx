"use client"

import { createChat, findChat, getUsers } from "@/actions/chat"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { FaXmark } from "react-icons/fa6"

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
  const router = useRouter()

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  const handleCreateChat = async () => {
    if (!selectedUsers.length) return

    const chat = await createChat(selectedUsers, groupName)

    router.push(`/c/${chat.id}`)
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
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2>create a new chat</h2>
          <button onClick={onClose} className="text-dark hover:text-opacity-80">
            <FaXmark className="text-xl" />
          </button>
        </div>
        <input
          type="text"
          placeholder="group name (optional)"
          value={groupName}
          disabled={groupExists}
          onChange={(e) => setGroupName(e.target.value)}
          className="focus:ring-sunset mb-3 w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-red-50"
        />

        <input
          type="text"
          placeholder="search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus:ring-sunset mb-3 w-full flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
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
              className="hover:bg-sunset mb-2 flex cursor-pointer items-center rounded-lg p-2 hover:bg-opacity-10"
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="peer hidden"
              />
              <div className="border-sunset peer-checked:bg-sunset duration-10 mr-3 h-5 w-5 rounded-full border-2 transition-colors peer-checked:bg-opacity-90" />
              <span className="text-sm">{user.name}</span>
            </label>
          ))}
          <div className="flex w-full justify-center">
            <button
              disabled={groupExists}
              onClick={handleCreateChat}
              className="bg-sunset w-1/2 rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:cursor-pointer disabled:bg-opacity-50"
            >
              create chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatModal
