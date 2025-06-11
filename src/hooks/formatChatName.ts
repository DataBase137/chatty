export const formatChatName = (chat: Chat, userId: string) => {
  if (chat.name && chat.isGroup) {
    return chat.name
  }
  return chat.participants
    .filter((participant) => participant.id !== userId)
    .map((participant) => participant.name)
    .join(", ")
}
