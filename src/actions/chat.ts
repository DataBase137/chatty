"use server"

import prisma from "@/lib/db"
import Pusher from "pusher"

export const getChats = async (userId: string) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return chats
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getMessages = async (chatId?: string) => {
  if (!chatId) return null
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
      take: 50,
    })

    return messages.reverse()
  } catch (error) {
    console.error(error)
    return null
  }
}

export const sendMessage = async (
  chatId: string,
  authorId: string,
  text: string
) => {
  try {
    const payload = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId,
          authorId,
          text,
        },
        include: {
          author: true,
        },
      }),
      prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ])

    // payload[0].createdAt = new Date(payload[0].createdAt)

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

export const createChat = async (userId: string) => {
  try {
    await prisma.chat.create({
      data: {
        name: "untitled chat",
        participants: {
          connect: {
            id: userId,
          },
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const deleteChat = async (chatId: string) => {
  try {
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const verifyChat = async (userId: string, chatId: string) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    })

    return chat
  } catch (error) {
    console.error(error)
    return null
  }
}