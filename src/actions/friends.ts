"use server"

import prisma from "@/lib/db"
import { FriendRequest as PrFriendRequest } from "@prisma/client"
import Pusher from "pusher"
import { createChat } from "./chat"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
})

export const sendRequest = async (
  userId: string,
  email: string
): Promise<{ error?: string }> => {
  try {
    const receiver = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!receiver) {
      throw new Error("Invalid email")
    }

    const request: PrFriendRequest & FriendRequest =
      await prisma.friendRequest.create({
        data: {
          senderId: userId,
          receiverId: receiver.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

    pusher.trigger(`user-${receiver.id}`, "new-request", { request })
    pusher.trigger(`user-${userId}`, "new-request", { request })

    return {}
  } catch (error) {
    return { error: "email" }
  }
}

export const acceptRequest = async (id: string): Promise<void> => {
  try {
    const request: PrFriendRequest & FriendRequest =
      await prisma.friendRequest.update({
        where: {
          id,
        },
        data: {
          status: "ACCEPTED",
          createdAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

    pusher.trigger(`user-${request.senderId}`, "update-request", { request })
    pusher.trigger(`user-${request.receiverId}`, "update-request", { request })

    await createChat([request.senderId, request.receiverId])
  } catch (error) {
    console.error(error)
  }
}

export const rejectRequest = async (id: string): Promise<void> => {
  try {
    const request: PrFriendRequest & FriendRequest =
      await prisma.friendRequest.update({
        where: {
          id,
        },
        data: {
          status: "DECLINED",
          createdAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

    pusher.trigger(`user-${request.senderId}`, "update-request", { request })
  } catch (error) {
    console.error(error)
  }
}

export const cancelRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: {
          senderId: friendId,
          receiverId: userId,
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const getFriendRequests = async (
  userId: string
): Promise<(PrFriendRequest & FriendRequest)[]> => {
  try {
    const requests: (PrFriendRequest & FriendRequest)[] =
      await prisma.friendRequest.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

    return requests
  } catch (error) {
    console.error(error)
    return []
  }
}
