"use client"

import { sendRequest } from "@/actions/friends"
import Friend from "@/components/chat/friend"
import { FriendRequest as PrFriendRequest, User } from "@prisma/client"
import Pusher from "pusher-js"
import { FC, useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { FaArrowLeft, FaPlus } from "react-icons/fa6"
import Form from "next/form"
import Link from "next/link"

interface FriendsProps {
  initFriends: (PrFriendRequest & FriendRequest)[]
  user: User
  dedicated?: boolean
}

const Friends: FC<FriendsProps> = ({ initFriends, user, dedicated }) => {
  const [friends, setFriends] =
    useState<(PrFriendRequest & FriendRequest)[]>(initFriends)
  const [state, formAction] = useActionState(sendRequest, "")
  const emailRef = useRef<HTMLInputElement>(null)
  const { pending } = useFormStatus()

  switch (state) {
    case "invalid email":
      emailRef.current?.setCustomValidity("no user with that email exists")
      break
    case "current user":
      emailRef.current?.setCustomValidity("enter a different email")
      break
  }

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    })

    const channel = pusher.subscribe(`user-${user.id}`)

    channel.bind(
      "new-request",
      (data: { request: PrFriendRequest & FriendRequest }) => {
        const request = data.request

        setFriends((prev) => [request, ...prev])
      }
    )

    channel.bind(
      "update-request",
      (data: { request: PrFriendRequest & FriendRequest }) => {
        const request = data.request

        setFriends((prev) =>
          prev.map((f) =>
            f.id === request.id ? { ...f, status: request.status } : f
          )
        )
      }
    )

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user-${user.id}`)
    }
  }, [user])

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4">
      <div
        className={`flex w-full items-center ${dedicated ? "justify-between" : "justify-center"} px-4`}
      >
        {dedicated ? (
          <>
            <Link
              className="ml-[-2rem] rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
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
            className="input valid:ring-green-500 invalid:ring-red-500"
            required
            ref={emailRef}
            autoComplete="off"
            onChange={(e) => e.currentTarget.setCustomValidity("")}
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
