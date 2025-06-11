"use client"

import { acceptRequest, rejectRequest, sendRequest } from "@/actions/friends"
import { FriendRequest as PrFriendRequest, User } from "@prisma/client"
import Pusher from "pusher-js"
import { FC, useEffect, useRef, useState } from "react"
import { FaCheck, FaPlus, FaXmark } from "react-icons/fa6"

interface FriendsProps {
  initFriends: (PrFriendRequest & FriendRequest)[]
  user: User
}

const Friends: FC<FriendsProps> = ({ initFriends, user }) => {
  const [friends, setFriends] =
    useState<(PrFriendRequest & FriendRequest)[]>(initFriends)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSendRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email")).trim()

    if (email) {
      if (email === user.email) {
        emailRef.current?.setCustomValidity("enter a different email")
      } else {
        sendRequest(user.id, email).then((payload) => {
          if (payload.error) {
            emailRef.current?.setCustomValidity(
              "no user with that email exists"
            )
            return
          }

          e.currentTarget.reset()
        })
      }
    }
  }

  const handleUpdateRequest = (id: string, type: "accept" | "decline") => {
    if (type === "accept") {
      acceptRequest(id)
    } else {
      rejectRequest(id)
    }
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
      <h1>friends</h1>
      <div className="w-2/3 px-8 py-2">
        <form onSubmit={(e) => handleSendRequest(e)} className="flex gap-2">
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
          <button
            type="submit"
            className="rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
          >
            <FaPlus />
          </button>
        </form>
      </div>
      <div className="flex w-2/3 flex-col gap-2 px-8">
        {friends.map((friend) => {
          const isSender = friend.senderId === user.id

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-2xl bg-slate-300 bg-opacity-20 px-5 py-4 transition"
            >
              <p className="pl-1 font-semibold">
                {isSender ? friend.receiver.name : friend.sender.name}
              </p>
              {isSender || friend.status != "PENDING" ? (
                <p className="py-[0.5625rem] pr-2.5 text-xs font-light text-slate-600">
                  {friend.status.toLocaleLowerCase()}
                </p>
              ) : (
                <div>
                  <button
                    className="rounded-2xl p-2.5 text-sm transition hover:bg-green-300 hover:bg-opacity-40"
                    onClick={() => handleUpdateRequest(friend.id, "accept")}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="rounded-2xl p-2.5 text-base transition hover:bg-red-300 hover:bg-opacity-40"
                    onClick={() => handleUpdateRequest(friend.id, "decline")}
                  >
                    <FaXmark />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Friends
