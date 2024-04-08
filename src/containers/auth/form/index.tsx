"use client"

import { useFormState } from "react-dom"
import { authenticate } from "@/actions/auth"
import { useRef } from "react"
import Button from "@/components/Button"
import Sidebar from "./sidebar"

const Form = ({ username }: Readonly<{ username?: boolean }>) => {
  const [state, formAction] = useFormState(authenticate, "")
  const name = username ? "sign up" : "log in"
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
        <Button color="secondary" submit>
          {name}
        </Button>
      </form>
      <Sidebar username={username} />
    </div>
  )
}

export default Form
