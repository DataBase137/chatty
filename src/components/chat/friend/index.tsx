import { FC } from "react"
import { FriendRequest as PrFriendRequest } from "@prisma/client"
import { acceptRequest, rejectRequest } from "@/actions/friends"
import { FaCheck, FaXmark } from "react-icons/fa6"

interface FriendProps {
  isSender: boolean
  friend: PrFriendRequest & FriendRequest
}

const Friend: FC<FriendProps> = ({ isSender, friend }) => {
  const handleUpdateRequest = (id: string, type: "accept" | "decline") => {
    if (type === "accept") {
      acceptRequest(id)
    } else {
      rejectRequest(id)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-300 bg-opacity-20 px-5 py-4 transition">
      <p className="pl-1 font-semibold">
        {isSender ? friend.receiver.name : friend.sender.name}
      </p>
      {isSender || friend.status != "PENDING" ? (
        <p className="py-[10px] pr-2.5 text-xs font-light text-slate-600">
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
}

export default Friend
