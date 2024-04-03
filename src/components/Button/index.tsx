"use client"

import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"

const Button = ({
  small,
  submit,
  name,
  action,
  route,
  accent,
}: Readonly<{
  small?: boolean
  submit?: boolean
  name: string
  action?: () => void
  route?: string
  accent?: boolean
}>) => {
  const router = useRouter()
  const { pending } = useFormStatus()

  const handleClick = () => {
    if (route) {
      router.push(route)
    } else if (action) {
      action()
    }
  }

  return (
    <button
      onClick={handleClick}
      type={submit ? "submit" : "button"}
      disabled={pending}
      className={`
      ${small ? "rounded-xl px-8 py-3 hover:translate-y-[-2px]" : "rounded-2xl px-10 py-4 hover:translate-y-[-3px]"}
      ${
        accent
          ? "bg-accent bg-opacity-60 hover:bg-opacity-45 hover:shadow-secondary disabled:bg-opacity-50"
          : "bg-primary hover:bg-opacity-80 hover:shadow-primary disabled:bg-opacity-70"
      }
      w-max text-base text-text transition-all hover:shadow-[0_20px_60px_-15px] disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
    >
      {name}
    </button>
  )
}

export default Button
