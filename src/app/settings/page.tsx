import { deleteUser, getUser } from "@/actions/auth"
import { NextPage } from "next"

const Page: NextPage = async () => {
  const user = await getUser()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <h1>settings</h1>
      <h2>account</h2>
      <div className="text-sm text-slate-500">
        <div>{user.name}</div>
        <div>{user.email}</div>
      </div>
      <button
        className="mt-2 rounded-full bg-red-500 bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
        onClick={async () => {
          "use server"
          await deleteUser(user.id)
        }}
      >
        delete account
      </button>
    </div>
  )
}

export default Page
