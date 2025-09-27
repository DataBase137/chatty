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

const setCookie = async (name: string, data: string, expires: Date) => {
  const cookieStore = await cookies()

  cookieStore.set(name, data, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires,
  })
}

export const authenticate = async (formData: FormData) => {
  const result = await (formData.get("name")
    ? signUp(formData)
    : login(formData))

  if (result.error) {
    return result.error
  }

  const token = await generateToken(result.user!.id)
  await setCookie(
    "token",
    token,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  )

  redirect("/c")
}

const signUp = async (formData: FormData) => {
  const { email, name, password } = Object.fromEntries(formData.entries())

  const hashedPassword = await bcrypt.hash(password as string, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase(),
        name: name as string,
        password: hashedPassword,
      },
    })

    return { type: "signup", user }
  } catch (error: any) {
    return {
      type: "signup",
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
  const cookieStore = await cookies()

  cookieStore.delete("token")

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
  const cookieStore = await cookies()

  try {
    const token = cookieStore.get("token")?.value

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
    return null
  }
}

export const deleteUser = async () => {
  const user = await getUser()
  if (!user) return

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  })

  await logOut()
}

export const changeEmail = async (formData: FormData) => {
  const user = await getUser()
  if (!user) return

  const email = formData.get("email") as string

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const changePassword = async (formData: FormData) => {
  const user = await getUser()
  if (!user) return

  const password = formData.get("current-password") as string
  const newPassword = formData.get("new-password") as string

  try {
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) throw new Error("Invalid password")

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const updateAccount = async (_: unknown, formData: FormData) => {
  const user = await getUser()

  const results: {
    field: "name" | "email" | "password"
    status: "success" | "error"
    message: string
  }[] = []

  if (!user) return results

  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const currentPassword = formData.get("current-password") as string
    const newPassword = formData.get("new-password") as string

    if (name && name !== user.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } })
      results.push({
        field: "name",
        status: "success",
        message: "username updated",
      })
    }

    if (email && email !== user.email) {
      await prisma.user.update({ where: { id: user.id }, data: { email } })
      results.push({
        field: "email",
        status: "success",
        message: "email updated",
      })
    }

    if (currentPassword && newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        results.push({
          field: "password",
          status: "error",
          message: "current password is incorrect",
        })
      } else {
        const hashed = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashed },
        })
        results.push({
          field: "password",
          status: "success",
          message: "password updated",
        })
      }
    }
  } catch (error) {
    console.error(error)
    results.push({ field: "name", status: "error", message: "update failed" })
  }

  return results
}
