import { deleteUser, getUser } from "@/actions/auth"
import { NextPage } from "next"

const Page: NextPage = async () => {
  const user = await getUser()

  return (
    <>
      <div>{user.name}</div>
      <div>{user.email}</div>
      <button
        onClick={async () => {
          "use server"
          await deleteUser(user.id)
        }}
        className="button-color button-small button-accent hover:shadow-accent"
      >
        delete account
      </button>
    </>
  )
}

export default Page
