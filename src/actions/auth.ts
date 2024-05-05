"use server"

import { SignJWT, jwtVerify } from "jose"
import prisma from "@/lib/db"
import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { User } from "@prisma/client"

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)

export const generateToken = async (id: string) => {
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret)

  return token
}

const setCookie = (name: string, data: string, expires: Date) => {
  cookies().set(name, data, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires,
  })
}

export const authenticate = async (
  _currentState: unknown,
  formData: FormData
) => {
  // If the form has a username field, it's a signup form
  const result = await (formData.get("name")
    ? signUp(formData)
    : login(formData))

  if (result.error) {
    return result.error
  }

  const token = await generateToken(result.user!.id)
  setCookie("token", token, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  redirect("/c")
}

const signUp = async (formData: FormData) => {
  const { email, name, password } = Object.fromEntries(formData.entries())

  const hashedPassword = await bcrypt.hash(password as string, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: email as string,
        name: name as string,
        password: hashedPassword,
      },
    })

    return { type: "signup", user }
  } catch (error: any) {
    return {
      type: "signup",
      // Error is set to the field that caused the error
      error: `${error.code === "P2002" && error.meta.target[0]}`,
    }
  }
}

const login = async (formData: FormData) => {
  const { email, password } = Object.fromEntries(formData.entries())

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email as string,
      },
    })

    if (!user) throw new Error("Invalid email")

    const passwordMatch = await bcrypt.compare(
      password as string,
      user.password
    )

    if (!passwordMatch) throw new Error("Invalid password")

    return { type: "login", user }
  } catch (error: any) {
    if (error.message === "Invalid password") {
      return { type: "login", error: "password" }
    }

    return { type: "login", error: "email" }
  }
}

export const logOut = async () => {
  cookies().delete("token")

  redirect("/login")
}

export const verifyAuth = async (token: string) => {
  try {
    const verified = await jwtVerify(token, jwtSecret, {
      algorithms: ["HS256"],
    })

    return verified
  } catch {
    return null
  }
}

export const getUser = async () => {
  try {
    const token = cookies().get("token")?.value

    if (!token) throw new Error("No token found")

    const verified = await jwtVerify(token, jwtSecret, {
      algorithms: ["HS256"],
    })

    const user: User | null = await prisma.user.findUnique({
      where: {
        id: verified.payload.sub,
      },
    })

    if (!user) throw new Error("User not found")

    return user
  } catch (error) {
    console.error(error)
    return {} as User
  }
}

export const deleteUser = async (userId: string) => {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  })

  await logOut()
}
