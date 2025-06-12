import Skeleton from "@/components/skeleton"

export const FriendsSkeleton = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4 px-4">
      <div className="h-8" />
      <div className="w-2/3 px-8 py-2">
        <div className="flex gap-2">
          <Skeleton className="h-11 w-full rounded-[1.5rem]" />
          <Skeleton className="h-11 w-[54px] rounded-full shadow-md" />
        </div>
      </div>
      <div className="flex w-2/3 flex-col gap-2 px-8">
        <Skeleton className="h-[68px] w-full rounded-2xl" />
        <Skeleton className="h-[68px] w-full rounded-2xl" />
        <Skeleton className="h-[68px] w-full rounded-2xl" />
        <Skeleton className="h-[68px] w-full rounded-2xl" />
        <Skeleton className="h-[68px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
