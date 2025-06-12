import Skeleton from "@/components/skeleton"

export const SidebarSkeleton = () => {
  return (
    <div className="flex h-full min-w-80 flex-col gap-3 px-4">
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-end">
          <Skeleton className="h-[38px] w-[54px] rounded-full shadow-md" />
        </div>
        <Skeleton className="h-11 w-full rounded-[1.5rem]" />
      </div>
      <div className="flex h-full flex-col gap-2 overflow-y-auto">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[46px] w-full rounded-[1.5rem]" />
    </div>
  )
}
