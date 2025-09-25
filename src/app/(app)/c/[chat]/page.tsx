import { headers } from "next/headers"
import { Suspense } from "react"
import { MessagesSkeleton } from "@/components/skeletons/messages"
import MessagesWrapper from "@/containers/chat/messages/wrapper"

const Page = async () => {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname")
  const chat = pathname?.slice(3)

  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesWrapper chatId={chat} />
    </Suspense>
  )
}

export default Page
