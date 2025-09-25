import { FC } from "react"
import Friends from "."
import { getUser } from "@/actions/auth"
import { getFriendRequests } from "@/actions/friends"

const FriendsWrapper: FC<{ dedicated?: boolean }> = async ({ dedicated }) => {
  const user = await getUser()
  const friends = await getFriendRequests()

  return <Friends initFriends={friends} user={user} dedicated={dedicated} />
}

export default FriendsWrapper
