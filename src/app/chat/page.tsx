import { getProfile, logOut } from "@/actions/auth"

const Page = async () => {
  const user = await getProfile()

  return (
    <>
      <div>{user?.name}</div>
      <form action={logOut}>
        <button type="submit">Log out</button>
      </form>
    </>
  )
}

export default Page
