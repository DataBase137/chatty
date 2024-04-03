import Link from "next/link"
import Button from "../Button"

const Navbar = ({ button }: Readonly<{ button?: boolean }>) => {
  return (
    <nav className="fixed flex h-20 w-full items-center justify-between px-8">
      <Link
        href="/"
        className="font-medium transition-all hover:translate-y-[-2px] hover:opacity-70"
      >
        chatty
      </Link>
      <div className="flex gap-12">
        <div className="flex items-center gap-12">
          <Link
            className="transition-all hover:translate-y-[-2px] hover:opacity-70"
            href="#"
          >
            info
          </Link>
          <Link
            className="transition-all hover:translate-y-[-2px] hover:opacity-70"
            href="#"
          >
            features
          </Link>
          <Link
            className="transition-all hover:translate-y-[-2px] hover:opacity-70"
            href="#"
          >
            privacy
          </Link>
        </div>
        {button && <Button route="/signup" accent small name="sign up" />}
      </div>
    </nav>
  )
}

export default Navbar
