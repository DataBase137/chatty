import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const chatParams = await context.params

  const messages = await prisma.message.findMany({
    where: { chatId: chatParams.chatId },
    orderBy: { createdAt: "asc" },
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

  return NextResponse.json(messages || [])
}
