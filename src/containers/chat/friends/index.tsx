"use client"

import { sendRequest } from "@/actions/friends"
import Friend from "@/components/chat/friend"
import { FriendRequest as PrFriendRequest, User } from "@prisma/client"
import { FC, useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { FaArrowLeft, FaPlus } from "react-icons/fa6"
import Form from "next/form"
import Link from "next/link"
import { usePusher } from "@/hooks/usePusher"

interface FriendsProps {
  initFriends: (PrFriendRequest & FriendRequest)[]
  user: User
  dedicated?: boolean
}

const Friends: FC<FriendsProps> = ({ initFriends, user, dedicated }) => {
  const [friends, setFriends] = useState(initFriends)
  const [state, formAction] = useActionState(sendRequest, "")
  const emailRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const { pending } = useFormStatus()
  const { subscribe } = usePusher()

  // handle server state changes
  useEffect(() => {
    if (state === "invalid email") {
      setError("no user with that email exists")
    } else if (state === "current user") {
      setError("enter a different email")
    } else if (state === "success") {
      setError("")
      setValue("") // reset input
    } else if (state === "unexpected error") {
      setError("something went wrong")
    }

    // auto-dismiss after 3 seconds
    if (state && state !== "success") {
      const timer = setTimeout(() => setError(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [state])

  useEffect(() => {
    subscribe(
      `user-${user.id}`,
      "new-request",
      (data: {
        request: PrFriendRequest & { sender: User; receiver: User }
      }) => {
        setFriends((prev) => [data.request, ...prev])
      }
    )

    subscribe(
      `user-${user.id}`,
      "update-request",
      (data: {
        request: PrFriendRequest & { sender: User; receiver: User }
      }) => {
        setFriends((prev) =>
          prev.map((f) =>
            f.id === data.request.id ? { ...f, status: data.request.status } : f
          )
        )
      }
    )
  }, [user, subscribe])

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4">
      <div
        className={`flex w-full items-center ${
          dedicated ? "justify-between" : "justify-center"
        } px-4`}
      >
        {dedicated ? (
          <>
            <Link
              className="-ml-8 rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
              href="/c"
            >
              <FaArrowLeft />
            </Link>
            <h2 className="text-2xl font-semibold">friends</h2>
            <div />
          </>
        ) : (
          <h2 className="text-2xl font-semibold">friends</h2>
        )}
      </div>

      <div className="w-5/6 py-2">
        <Form action={formAction} className="flex gap-2">
          <input
            placeholder="add friend"
            type="email"
            name="email"
            value={value}
            className={`input ${error ? "ring-red-500" : "valid:ring-green-500"}`}
            required
            ref={emailRef}
            autoComplete="off"
            onChange={(e) => {
              e.currentTarget.setCustomValidity("")
              setValue(e.target.value)
              setError("") // clear error while typing
            }}
          />

          <input hidden readOnly name="user-id" value={user.id} />

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
          >
            <FaPlus />
          </button>
        </Form>

        <p className="h-5 pl-3 pt-1 text-xs text-red-600">{error}</p>
      </div>

      <div className="flex w-5/6 max-w-[500px] flex-col gap-2 overflow-y-scroll">
        {friends.map((friend) => (
          <Friend
            isSender={friend.senderId === user.id}
            key={friend.id}
            friend={friend}
          />
        ))}
      </div>
    </div>
  )
}

export default Friends
