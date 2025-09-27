import { getUser } from "@/actions/auth"
import AccountForm from "@/containers/settings/form"
import { NextPage } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FaArrowLeft } from "react-icons/fa6"

const Page: NextPage = async () => {
  const user = await getUser()
  if (!user) redirect("/")

  return (
    <div className="flex h-full w-full flex-col justify-between px-6">
      <div className="flex h-20 w-full items-center justify-between px-8">
        <Link
          className="ml-[-2rem] rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
          href="/c"
        >
          <FaArrowLeft />
        </Link>

        <h1>settings</h1>
        <div></div>
      </div>

      <div className="mb-20 flex h-full w-full flex-col items-center justify-center gap-4">
        <h2 className="text-lg font-normal">account information</h2>
        <AccountForm user={user} />
      </div>
    </div>
  )
}

export default Page
