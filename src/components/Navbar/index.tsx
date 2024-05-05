import Link from "next/link"
import { FC } from "react"

const Navbar: FC<{ button?: boolean }> = ({ button }) => {
  const links = [
    { name: "info", href: "#" },
    { name: "features", href: "#" },
    { name: "privacy", href: "#" },
  ]

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
          {links.map((link) => (
            <Link
              className="transition-all hover:translate-y-[-2px] hover:opacity-70"
              href={link.href}
              key={link.name}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {button && (
          <Link
            href="/signup"
            className="button-color button-small button-accent hover:shadow-accent"
          >
            sign up
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
