import Link from "next/link"
import { FC } from "react"

const Navbar: FC<{ button?: boolean }> = ({ button }) => {
  return (
    <nav className="fixed flex h-20 w-full items-center justify-between px-8">
      <Link href="/">chatty</Link>
      {button && (
        <Link
          href="/signup"
          className="bg-sunset rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70"
        >
          sign up
        </Link>
      )}
    </nav>
  )
}

export default Navbar
