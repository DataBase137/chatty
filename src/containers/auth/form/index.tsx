"use client"

import { authenticate } from "@/actions/auth"
import { FC, useState, useEffect } from "react"
import Link from "next/link"
import Form from "next/form"

const AuthForm: FC<{ username?: boolean }> = ({ username }) => {
  const [status, setStatus] = useState("")
  const [pending, setPending] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const formAction = async (formData: FormData) => {
    setPending(true)
    const res = await authenticate(formData)
    setStatus(res)
    setPending(false)
  }

  useEffect(() => {
    setNameError("")
    setEmailError("")
    setPasswordError("")

    switch (status) {
      case "email":
        if (username) setEmailError("email already exists")
        else setEmailError("incorrect email")
        break
      case "password":
        setPasswordError("incorrect password")
        break
    }
  }, [status, username])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Form
        action={formAction}
        className="h-42 flex w-80 flex-col justify-center"
      >
        <div className="flex flex-col gap-2">
          {username && (
            <div className="flex flex-col">
              <input
                type="text"
                name="name"
                placeholder="username"
                autoComplete="off"
                required
                minLength={2}
                className={`input ${
                  nameError ? "ring-red-500" : "valid:ring-green-500"
                }`}
                value={name}
                onChange={(e) => {
                  e.currentTarget.setCustomValidity("")
                  setName(e.target.value)
                  setNameError("")
                  setStatus("")
                }}
              />
              {nameError && <p className="text-xs text-red-600">{nameError}</p>}
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="email"
            autoComplete="username"
            required
            className={`input ${
              emailError ? "ring-red-500" : "valid:ring-green-500"
            }`}
            value={email}
            onChange={(e) => {
              e.currentTarget.setCustomValidity("")
              setEmail(e.target.value)
              setEmailError("")
              setStatus("")
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="password"
            autoComplete={username ? "new-password" : "current-password"}
            required
            minLength={6}
            className={`input ${
              passwordError ? "ring-red-500" : "valid:ring-green-500"
            }`}
            value={password}
            onChange={(e) => {
              e.currentTarget.setCustomValidity("")
              setPassword(e.target.value)
              setPasswordError("")
              setStatus("")
            }}
          />
        </div>

        <p className="h-5 pl-2 pt-1 text-xs text-red-600">
          {emailError || passwordError}
        </p>

        <button
          className="mt-2 rounded-full bg-sunset bg-opacity-90 px-5 py-3 text-sm text-white shadow-md transition-all hover:bg-opacity-70 disabled:cursor-pointer disabled:bg-opacity-50"
          type="submit"
          disabled={pending}
        >
          {username ? "sign up" : "log in"}
        </button>
      </Form>

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

export default AuthForm
