import { NextPage } from "next"
import { fetchData } from "@/actions/chat"
import Sidebar from "@/containers/chat/sidebar"
import Friends from "@/containers/chat/friends"
import { SidebarSkeleton } from "@/components/skeletons/sidebar"
import { Suspense } from "react"
import { FriendsSkeleton } from "@/components/skeletons/friends"

const Page: NextPage = async () => {
  const { user, chats, friends } = await fetchData()

  return (
    <div className="flex h-full p-6">
      <div className="hidden min-w-80 md:flex">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar initChats={chats} user={user} globChat={null} />
        </Suspense>
      </div>
      <Suspense fallback={<FriendsSkeleton />}>
        <Friends initFriends={friends} user={user} dedicated />
      </Suspense>
    </div>
  )
}

export default Page
