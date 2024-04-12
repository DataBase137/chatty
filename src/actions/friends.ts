"use server"

import prisma from "@/lib/db"

export const addFriend = async (userIdA: string, userIdB: string) => {
  try {
    await prisma.user.update({
      where: {
        id: userIdA,
      },
      data: {
        friends: {
          connect: {
            id: userIdB,
          },
        },
      },
    })

    await prisma.user.update({
      where: {
        id: userIdB,
      },
      data: {
        friends: {
          connect: {
            id: userIdA,
          },
        },
      },
    })

    await prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          connect: [{ id: userIdA }, { id: userIdB }],
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const removeFriend = async (userIdA: string, userIdB: string) => {
  await prisma.user.update({
    where: { id: userIdA },
    data: { friends: { disconnect: [{ id: userIdB }] } },
  })

  await prisma.user.update({
    where: { id: userIdB },
    data: { friends: { disconnect: [{ id: userIdA }] } },
  })
}

export const getFriends = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: true },
  })

  return user?.friends
}
