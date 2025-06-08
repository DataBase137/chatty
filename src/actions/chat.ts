"use server"

import prisma from "@/lib/db"
import Pusher from "pusher"
import { getUser } from "./auth"
import { User } from "@prisma/client"

export const getChats = async (id: string): Promise<Chat[]> => {
  try {
    const chats: Chat[] = await prisma.chat.findMany({
      where: { participants: { some: { id } } },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: { select: { name: true } } },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    })

    return chats
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      include: { author: true },
      take: 50,
    })

    return messages.reverse() as Message[] | []
  } catch (error) {
    console.error(error)
    return []
  }
}

export const sendMessage = async (
  chatId: string,
  authorId: string,
  text: string
): Promise<void> => {
  try {
    const payload = await prisma.$transaction([
      prisma.message.create({
        data: { chatId, authorId, text },
        include: { author: true },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: new Date() },
      }),
    ])

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID as string,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
      secret: process.env.PUSHER_SECRET as string,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      useTLS: true,
    })

    pusher.trigger(`chat-${chatId}`, "new-message", {
      message: `${JSON.stringify(payload[0])}\n\n`,
    })
  } catch (error) {
    console.error(error)
  }
}

export const createChat = async (
  members: string[],
  name?: string
): Promise<Chat> => {
  try {
    const chat = await prisma.chat.create({
      data: {
        participants: {
          connect: members.map((memberId) => ({ id: memberId })),
        },
        name,
        isGroup: members.length > 2,
      },
    })

    return chat as Chat
  } catch (error) {
    console.error(error)
    return {} as Chat
  }
}

export const verifyChat = async (
  userId: string,
  chatId: string
): Promise<Chat | null> => {
  try {
    const chat: Chat | null = await prisma.chat.findFirst({
      where: { id: chatId, participants: { some: { id: userId } } },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: { select: { name: true } } },
        },
      },
    })

    return chat
  } catch (error) {
    console.error(error)
    return null
  }
}

export const fetchData = async (
  chatId?: string
): Promise<{
  user: User
  chat: Chat | null
  chats: Chat[]
  messages: Message[]
}> => {
  try {
    const user = await getUser()

    const chats = await getChats(user.id)

    let messages: Message[] = []
    let chat: Chat | null = null

    if (chatId) {
      chat = await verifyChat(user.id, chatId)

      messages = await getMessages(chatId)
    }

    return { user, chat, chats, messages }
  } catch (error) {
    console.error(error)
    return { user: {} as User, chat: null, chats: [], messages: [] }
  }
}

// TODO replace with friends list
export const getUsers = async (search: string): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    return users as User[]
  } catch (error) {
    console.error(error)
    return []
  }
}

export const findChat = async (userIds: string[]): Promise<Chat | null> => {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            id: {
              in: userIds,
            },
          },
        },
      },
    })

    return chat as Chat | null
  } catch (error) {
    console.error(error)
    return null
  }
}
