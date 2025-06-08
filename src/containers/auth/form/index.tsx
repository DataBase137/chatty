"use client"

import { useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth"
import { FC, useActionState, useRef } from "react"
import Link from "next/link"

const Form: FC<{ username?: boolean }> = ({ username }) => {
  const [state, formAction] = useActionState(authenticate, "")
  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const { pending } = useFormStatus()

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
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <form
        action={formAction}
        className="h-42 flex w-80 flex-col justify-center gap-2"
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
            className="focus:ring-sunset flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
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
          className="focus:ring-sunset flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
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
          className="focus:ring-sunset flex-1 rounded-[1.5rem] bg-slate-300 bg-opacity-20 px-5 py-3 text-sm text-opacity-70 transition-all focus:outline-none focus:ring-2"
          onChange={(e) => e.target.setCustomValidity("")}
        />
        <button
          className="bg-sunset mt-2 rounded-full bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:cursor-pointer disabled:bg-opacity-50"
          type="submit"
          disabled={pending}
        >
          {username ? "sign up" : "log in"}
        </button>
      </form>
      <div>
        <p className="text-sm">
          {username ? "already have an account? " : "don't have an account? "}
          <Link
            href={username ? "/login" : "/signup"}
            className="text-plum hover:text-opacity-80"
          >
            {username ? "log in" : "sign up"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Form
