"use server"

import prisma from "@/lib/db"

export const sendRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const acceptRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    await prisma.friendRequest.update({
      where: {
        senderId_receiverId: {
          senderId: friendId,
          receiverId: userId,
        },
      },
      data: {
        status: "ACCEPTED",
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const rejectRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    await prisma.friendRequest.update({
      where: {
        senderId_receiverId: {
          senderId: friendId,
          receiverId: userId,
        },
      },
      data: {
        status: "DECLINED",
      },
    })
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
): Promise<FriendRequest[]> => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return requests
  } catch (error) {
    console.error(error)
    return []
  }
}
