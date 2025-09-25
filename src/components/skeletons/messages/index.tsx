import Skeleton from "@/components/skeleton"

const MessageSkeleton = ({
  author,
  dimensions,
}: {
  author?: boolean
  dimensions: string
}) => {
  return (
    <div className={`flex w-full ${author && "justify-end"}`}>
      <Skeleton
        className={`${dimensions} max-w-[80%] rounded-[19px] shadow-sm`}
      />
    </div>
  )
}

export const MessagesSkeleton = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between px-4 pb-1">
        <Skeleton className="-ml-8 h-[34px] w-[34px] rounded-2xl" />
      </div>
      <div className="flex h-full max-h-full w-full flex-col gap-1.5 overflow-y-hidden">
        <MessageSkeleton dimensions="h-10 w-52" />
        <MessageSkeleton dimensions="h-10 w-28" />
        <MessageSkeleton dimensions="h-10 w-44" author />
        <MessageSkeleton dimensions="h-[60px] w-80" />
        <MessageSkeleton dimensions="h-10 w-52" author />
        <MessageSkeleton dimensions="h-10 w-64" author />
        <MessageSkeleton dimensions="h-10 w-60" />
        <MessageSkeleton dimensions="h-10 w-52" />
      </div>
      <div className="flex w-full gap-2">
        <Skeleton className="h-11 w-full rounded-[1.5rem]" />
        <Skeleton className="h-11 w-[54px] rounded-full shadow-md" />
      </div>
    </div>
  )
}
