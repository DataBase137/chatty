"use client"

import { useFormState, useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth"
import { FC, useRef } from "react"
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa6"
import Link from "next/link"

const Button: FC<{ name: string }> = ({ name }) => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="button-color button-secondary button-large hover:shadow-secondary"
    >
      {name}
    </button>
  )
}

const Form: FC<{ username?: boolean }> = ({ username }) => {
  const [state, formAction] = useFormState(authenticate, "")
  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  switch (state) {
    case "name":
      usernameRef.current?.setCustomValidity("username already exists")
      break
    case "email":
      emailRef.current?.setCustomValidity("email already exists")
      break
    case "password":
      passwordRef.current?.setCustomValidity("incorrect password")
      break
    default:
      break
  }

  return (
    <div className="flex h-full w-screen items-center">
      <form
        action={formAction}
        className="flex h-full w-full flex-col items-center justify-center gap-3 pt-20 text-xl"
      >
        {username && (
          <input
            type="text"
            name="name"
            placeholder="username"
            autoComplete="off"
            required
            minLength={2}
            ref={usernameRef}
            className="h-20 w-[25rem] rounded-2xl bg-neutral pl-7 text-text outline-0 placeholder-shown:!bg-neutral invalid:bg-red-100"
            onChange={(e) => e.target.setCustomValidity("")}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="email"
          autoComplete="username"
          required
          ref={emailRef}
          className="h-20 w-[25rem] rounded-2xl bg-neutral pl-7 text-text outline-0 placeholder-shown:!bg-neutral invalid:bg-red-100"
          onChange={(e) => e.target.setCustomValidity("")}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          autoComplete={username ? "new-password" : "current-password"}
          required
          minLength={6}
          ref={passwordRef}
          className="mb-2 h-20 w-[25rem] rounded-2xl bg-neutral pl-7 text-text outline-0 placeholder-shown:!bg-neutral invalid:bg-red-100"
          onChange={(e) => e.target.setCustomValidity("")}
        />
        <Button name={username ? "sign up" : "log in"} />
      </form>
      <div
        className={`flex h-screen w-1/2 min-w-[350px] flex-col items-center justify-center gap-3 bg-primary bg-opacity-30`}
      >
        <div className="text-2xl">or continue with</div>
        <div className="mb-5 flex gap-7">
          <FaApple className="cursor-pointer text-5xl hover:opacity-80" />
          <FaGoogle className="cursor-pointer text-5xl hover:opacity-80" />
          <FaFacebook className="cursor-pointer text-5xl hover:opacity-80" />
        </div>
        <div className="text-2xl">
          {username ? "already a user? " : "not a user yet? "}
          <Link
            href={username ? "login" : "signup"}
            className="cursor-pointer text-accent hover:text-opacity-80"
          >
            {username ? "log in" : "sign up"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Form
