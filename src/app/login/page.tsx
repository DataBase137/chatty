import { NextPage } from "next"
import AuthForm from "@/containers/auth/form"
import Navbar from "@/components/Navbar"

const Page: NextPage = () => {
  return (
    <>
      <Navbar />
      <AuthForm />
    </>
  )
}

export default Page
