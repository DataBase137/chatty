"use server"

import prisma from "@/lib/db"
import { FriendRequest as PrFriendRequest } from "@prisma/client"
import Pusher from "pusher"
import { createChat } from "./chat"
import { getUser } from "./auth"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "us3",
  useTLS: true,
})

export const sendRequest = async (
  _currentState: unknown,
  formData: FormData
) => {
  const email = String(formData.get("email")).trim()
  const userId = String(formData.get("user-id"))

  try {
    const receiver = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!receiver) {
      throw new Error("invalid email")
    }

    if (receiver.id === userId) {
      throw new Error("current user")
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

    await pusher.trigger(`user-${receiver.id}`, "new-request", { request })
    await pusher.trigger(`user-${userId}`, "new-request", { request })

    return {}
  } catch (error) {
    return error
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

    await pusher.trigger(`user-${request.senderId}`, "update-request", {
      request,
    })
    await pusher.trigger(`user-${request.receiverId}`, "update-request", {
      request,
    })

    await createChat([request.senderId], request.receiverId)
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

    await pusher.trigger(`user-${request.senderId}`, "update-request", {
      request,
    })
    await pusher.trigger(`user-${request.receiverId}`, "update-request", {
      request,
    })
  } catch (error) {
    console.error(error)
  }
}

export const cancelRequest = async (friendId: string): Promise<void> => {
  const user = await getUser()

  try {
    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: {
          senderId: friendId,
          receiverId: user.id,
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const getFriendRequests = async (): Promise<
  (PrFriendRequest & FriendRequest)[]
> => {
  const user = await getUser()

  try {
    const requests: (PrFriendRequest & FriendRequest)[] =
      await prisma.friendRequest.findMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
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

export const getFriends = async (): Promise<Friend[]> => {
  const user = await getUser()

  try {
    const requests: (PrFriendRequest & FriendRequest)[] =
      await prisma.friendRequest.findMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
          status: "ACCEPTED",
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

    const friends = requests.map((req) =>
      req.senderId === user.id ? req.receiver : req.sender
    )

    return friends
  } catch (error) {
    console.error(error)
    return []
  }
}
