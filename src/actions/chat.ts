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
        participants: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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
      include: {
        author: true,
        reactions: {
          include: { user: { select: { name: true, id: true, email: true } } },
        },
      },
    })

    return messages.reverse() as Message[] | []
  } catch (error) {
    console.error(error)
    return []
  }
}

export const sendMessage = async (formData: FormData): Promise<void> => {
  const text = String(formData.get("text"))
  const authorId = String(formData.get("user-id"))
  const chatId = String(formData.get("chat-id"))
  const now = new Date()

  if (!text.trim()) return

  try {
    const payload: [Message, PrChat] = await prisma.$transaction([
      prisma.message.create({
        data: { chatId, authorId, text },
        include: {
          author: true,
          reactions: {
            include: {
              user: { select: { name: true, id: true, email: true } },
            },
          },
        },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: now },
      }),
    ])

    await pusher.trigger(`chat-${chatId}`, "new-message", {
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

    chat.participants.map(async (user) => {
      await pusher.trigger(`user-${user.id}`, "new-chat", {
        chat,
      })
    })
  } catch (error) {
    console.error(error)
  }
}

export const createChatHandler = async (
  _currentState: unknown,
  formData: FormData
) => {
  const name = formData.get("name")
  const members = String(formData.get("users"))
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  await createChat(members, name ? String(name) : undefined)
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
        participants: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return chat as Chat
  } catch (error) {
    console.error(error)
    return null
  }
}

export const reactMessage = async (
  messageId: string,
  chatId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  try {
    const existingReaction = await prisma.reaction.findFirst({
      where: { messageId, userId },
    })

    const sameReaction = await prisma.reaction.findFirst({
      where: { messageId, userId, emoji },
    })

    if (sameReaction) {
      await prisma.reaction.delete({
        where: { id: sameReaction.id },
      })
    } else {
      if (existingReaction) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        })
      }

      await prisma.reaction.create({
        data: { messageId, userId, emoji },
      })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: true,
        reactions: {
          include: { user: { select: { name: true, id: true, email: true } } },
        },
      },
    })

    await pusher.trigger(`chat-${chatId}`, "react-message", {
      message,
    })
  } catch (error) {
    console.error(error)
  }
}

export const unsendMessage = async (
  messageId: string,
  chatId: string
): Promise<void> => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) return

    await prisma.message.delete({
      where: { id: messageId },
    })

    await pusher.trigger(`chat-${chatId}`, "unsend-message", {
      messageId,
    })
  } catch (error) {
    console.error(error)
  }
}

export const unsendMessageHandler = async (
  _currentState: unknown,
  formData: FormData
) => {
  const messageId = String(formData.get("message-id"))
  const chatId = String(formData.get("chat-id"))

  await unsendMessage(messageId, chatId)
}
