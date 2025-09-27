"use server"

import prisma from "@/lib/db"
import Pusher from "pusher"
import { Chat as PrChat } from "@prisma/client"
import { getUser } from "./auth"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "us3",
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
    const messages: Message[] = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { name: true, email: true, id: true } },
        reactions: {
          include: { user: { select: { name: true, id: true, email: true } } },
        },
        parent: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return messages
  } catch (error) {
    console.error(error)
    return []
  }
}

export const sendMessage = async (formData: FormData): Promise<void> => {
  const text = String(formData.get("text"))
  const authorId = String(formData.get("user-id"))
  const chatId = String(formData.get("chat-id"))
  const parentId = formData.get("reply-id") as string | null
  const now = new Date()

  if (text.trim() === "") return

  try {
    const payload = (await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId,
          authorId,
          text,
          parentId: parentId || null,
        },
        include: {
          author: true,
          reactions: {
            include: {
              user: { select: { name: true, id: true, email: true } },
            },
          },
          parent: {
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: now },
      }),
    ])) as [Message, PrChat]

    await pusher.trigger(`chat-${chatId}`, "new-message", {
      message: payload[0],
    })
  } catch (error) {
    console.error(error)
  }
}

export const createChat = async (
  members: string[],
  userId: string,
  name?: string
): Promise<Chat | null> => {
  members.push(userId)

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

    return chat
  } catch (error) {
    console.error(error)
    return null
  }
}

export const verifyChat = async (chatId: string): Promise<Chat | null> => {
  const user = await getUser()
  if (!user) return null

  try {
    const chat: Chat | null = await prisma.chat.findFirst({
      where: { id: chatId, participants: { some: { id: user.id } } },
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
    })

    return chat
  } catch (error) {
    console.error(error)
    return null
  }
}

export const findChat = async (userIds: string[]): Promise<Chat | null> => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          every: {
            id: { in: userIds },
          },
        },
      },
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

    const trueChats = chats.filter(
      (c) => c.participants.length === userIds.length
    )

    return trueChats.length > 0 ? trueChats[0] : null
  } catch (error) {
    console.error(error)
    return null
  }
}

export const reactMessage = async (
  messageId: string,
  emoji: string
): Promise<void> => {
  const user = await getUser()
  if (!user) return

  try {
    const existingReaction = await prisma.reaction.findFirst({
      where: { messageId, userId: user.id },
    })

    const sameReaction = await prisma.reaction.findFirst({
      where: { messageId, userId: user.id, emoji },
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
        data: { messageId, userId: user.id, emoji },
      })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: true,
        reactions: {
          include: { user: { select: { name: true, id: true, email: true } } },
        },
        parent: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    await pusher.trigger(`chat-${message?.chatId}`, "react-message", {
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

    const lastMessage: Message | null = await prisma.message.findFirst({
      where: { chatId },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: { select: { name: true, email: true, id: true } },
        reactions: {
          include: { user: { select: { name: true, id: true, email: true } } },
        },
        parent: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    await pusher.trigger(`chat-${chatId}`, "unsend-message", {
      messageId,
      lastMessage,
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

export const editMessage = async (formData: FormData): Promise<void> => {
  const text = String(formData.get("text"))
  const messageId = String(formData.get("message-id"))
  const chatId = String(formData.get("chat-id"))

  if (!text.trim()) return

  try {
    const message: Message = await prisma.message.update({
      where: { id: messageId },
      data: { text },
      include: {
        author: true,
        reactions: {
          include: {
            user: { select: { name: true, id: true, email: true } },
          },
        },
        parent: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    await pusher.trigger(`chat-${chatId}`, "edit-message", {
      message,
    })
  } catch (error) {
    console.error(error)
  }
}

export const renameChat = async (formData: FormData, chatId: string) => {
  try {
    const name = String(formData.get("name"))

    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { name },
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
    })

    await pusher.trigger(`chat-${chatId}`, "rename-chat", {
      chat,
    })
  } catch (error) {
    console.error(error)
  }
}

export const leaveChat = async (userId: string, chatId: string) => {
  try {
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { participants: { disconnect: { id: userId } } },
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
    })

    await pusher.trigger(`chat-${chatId}`, "leave-chat", {
      chat,
    })
  } catch (error) {
    console.error(error)
  }
}

export const deleteChat = async (chatId: string) => {
  try {
    await prisma.chat.delete({
      where: { id: chatId },
    })

    pusher.trigger(`chat-${chatId}`, "delete-chat", {
      chatId,
    })
  } catch (error) {
    console.error(error)
  }
}
