"use server"

import prisma from "@/lib/db"
import Pusher from "pusher"
import { getUser } from "./auth"
import {
  Chat as PrChat,
  User,
  FriendRequest as PrFriendRequest,
} from "@prisma/client"
import { getFriendRequests } from "./friends"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
})

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
  const now = new Date()

  try {
    const payload: [Message, PrChat] = await prisma.$transaction([
      prisma.message.create({
        data: { chatId, authorId, text },
        include: { author: true },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: now },
      }),
    ])

    pusher.trigger(`chat-${chatId}`, "new-message", {
      message: payload[0],
    })
  } catch (error) {
    console.error(error)
  }
}

export const createChat = async (
  members: string[],
  name?: string
): Promise<void> => {
  try {
    const chat: Chat = await prisma.chat.create({
      data: {
        participants: {
          connect: members.map((memberId) => ({ id: memberId })),
        },
        name,
        isGroup: members.length > 2,
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: { select: { name: true } } },
        },
      },
    })

    chat.participants.map((user) => {
      pusher.trigger(`user-${user.id}`, "new-chat", {
        chat,
      })
    })
  } catch (error) {
    console.error(error)
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
  globChat: Chat | null
  chats: Chat[]
  messages: Message[]
  friends: (PrFriendRequest & FriendRequest)[]
}> => {
  try {
    const user = await getUser()

    const chats = await getChats(user.id)

    const friends = await getFriendRequests(user.id)

    let messages: Message[] = []
    let chat: Chat | null = null

    if (chatId) {
      chat = await verifyChat(user.id, chatId)

      messages = await getMessages(chatId)
    }

    return { user, globChat: chat, chats, messages, friends }
  } catch (error) {
    console.error(error)
    return {
      user: {} as User,
      globChat: null,
      chats: [],
      messages: [],
      friends: [],
    }
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
        AND: [
          {
            participants: {
              every: {
                id: {
                  in: userIds,
                },
              },
            },
          },
          {
            participants: {
              none: {
                id: {
                  notIn: userIds,
                },
              },
            },
          },
        ],
      },
      include: {
        participants: true,
      },
    })

    return chat as Chat
  } catch (error) {
    console.error(error)
    return null
  }
}
