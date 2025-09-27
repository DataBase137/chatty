"use client"

import { deleteUser, updateAccount } from "@/actions/auth"
import { User } from "@prisma/client"
import Form from "next/form"
import { FC, useActionState, useRef, useState, useEffect } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa6"

const PasswordField: FC<{
  name: string
  placeholder: string
  inputRef: React.RefObject<HTMLInputElement>
}> = ({ name, placeholder, inputRef }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="flex w-full">
      <input
        ref={inputRef}
        name={name}
        type={isVisible ? "text" : "password"}
        autoComplete={name}
        minLength={6}
        className="input"
        placeholder={placeholder}
      />
      <div className="relative -left-10 top-1.5 w-0">
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="rounded-2xl p-2.5 text-sm transition hover:bg-slate-300 hover:bg-opacity-40"
          aria-label={isVisible ? "hide password" : "show password"}
        >
          {isVisible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  )
}

const AccountForm: FC<{ user: User }> = ({ user }) => {
  const [results, formAction] = useActionState(updateAccount, [])
  const [visibleResults, setVisibleResults] = useState(results)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [del, setDel] = useState(false)

  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const deleteRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    deleteRef.current?.setCustomValidity("incorrect")
  }, [])

  useEffect(() => {
    if (results.length > 0) {
      setVisibleResults(results)
      const timeout = setTimeout(() => {
        setVisibleResults([])
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [results])

  return (
    <div className="flex w-2/3 flex-col gap-2">
      <Form action={formAction} className="flex flex-col gap-2">
        <div>
          <div className="flex w-full items-center justify-between gap-2">
            <label className="pl-2 text-sm text-opacity-70">username</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
              type="text"
              autoComplete="off"
              minLength={2}
              className="input max-w-xl valid:ring-green-500 invalid:ring-red-500"
            />
          </div>
          <p
            className={`h-4 pr-3 pt-0.5 text-right text-xs transition-opacity duration-200 ${
              visibleResults.find((r) => r.field === "name")?.status ===
              "success"
                ? "text-green-600 opacity-100"
                : visibleResults.find((r) => r.field === "name")
                  ? "text-red-600 opacity-100"
                  : "opacity-0"
            }`}
          >
            {visibleResults.find((r) => r.field === "name")?.message ?? ""}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="pl-2 text-sm text-opacity-70">email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              autoComplete="username"
              type="email"
              className="input max-w-xl valid:ring-green-500 invalid:ring-red-500"
            />
          </div>
          <p
            className={`h-4 pl-2 text-xs transition-opacity duration-200 ${
              visibleResults.find((r) => r.field === "email")?.status ===
              "success"
                ? "text-green-600 opacity-100"
                : visibleResults.find((r) => r.field === "email")
                  ? "text-red-600 opacity-100"
                  : "opacity-0"
            }`}
          >
            {visibleResults.find((r) => r.field === "email")?.message ?? ""}
          </p>
        </div>

        <span className="my-3 h-[2px] w-full rounded-full bg-slate-400/20" />

        <div className="flex flex-col">
          <label className="pl-2 text-sm text-opacity-70">password</label>
          <div className="mt-3 flex w-full gap-2">
            <PasswordField
              name="current-password"
              placeholder="current password"
              inputRef={currentPasswordRef}
            />
            <PasswordField
              name="new-password"
              placeholder="new password"
              inputRef={newPasswordRef}
            />
          </div>
          <p
            className={`h-4 pl-2 pt-1 text-xs transition-opacity duration-200 ${
              visibleResults.find((r) => r.field === "password")?.status ===
              "success"
                ? "text-green-600 opacity-100"
                : visibleResults.find((r) => r.field === "password")
                  ? "text-red-600 opacity-100"
                  : "opacity-0"
            }`}
          >
            {visibleResults.find((r) => r.field === "password")?.message ?? ""}
          </p>
        </div>

        <button
          className="mt-2 rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:cursor-pointer disabled:bg-opacity-50"
          type="submit"
        >
          save changes
        </button>
      </Form>

      <span className="my-5 h-[3px] w-full rounded-full bg-slate-500/20" />

      <div className="flex flex-col">
        <label className="pl-2 text-sm text-opacity-70">delete account</label>
        <div className="mt-3 flex w-full gap-2">
          <input
            placeholder="type 'confirm deletion' to continue"
            autoComplete="off"
            name="name"
            type="text"
            className="input valid:ring-green-500 invalid:ring-red-500"
            onChange={(e) => {
              if (e.target.value === "confirm deletion") {
                e.target.setCustomValidity("")
                setDel(true)
              } else {
                e.target.setCustomValidity("incorrect")
                setDel(false)
              }
            }}
            ref={deleteRef}
          />
          <button
            className="rounded-full bg-red-500 bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:bg-opacity-50"
            disabled={!del}
            onClick={deleteUser}
          >
            delete account
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountForm
