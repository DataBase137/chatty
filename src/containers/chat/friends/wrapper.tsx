import { FC } from "react"
import Friends from "."
import { getUser } from "@/actions/auth"
import { getFriendRequests } from "@/actions/friends"
import { redirect } from "next/navigation"

const FriendsWrapper: FC = async () => {
  const user = await getUser()
  if (!user) redirect("/")

  const friends = await getFriendRequests()

  return <Friends initFriends={friends} user={user} />
}

export default FriendsWrapper
