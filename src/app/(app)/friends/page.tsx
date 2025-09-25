import { NextPage } from "next"
import { Suspense } from "react"
import { FriendsSkeleton } from "@/components/skeletons/friends"
import FriendsWrapper from "@/containers/chat/friends/wrapper"

const Page: NextPage = () => {
  return (
    <Suspense fallback={<FriendsSkeleton />}>
      <FriendsWrapper dedicated />
    </Suspense>
  )
}

export default Page
