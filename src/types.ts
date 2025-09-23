type Chat = {
  isGroup: boolean
  id: string
  name: string | null
  createdAt: Date
  lastMessageAt: Date
} & {
  participants: {
    id: string
    name: string
    email: string
  }[]
} & {
  messages:
    | {
        id: string
        text: string
        createdAt: Date
        authorId: string
        author: {
          name: string
        }
      }[]
    | null
}

type Message = {
  id: string
  text: string
  chatId: string
  createdAt: Date
  authorId: string
  parentId?: string | null
  parent?: Message | null
  replies?: Message[]
  reactions: ({
    user: {
      name: string
      id: string
      email: string
    }
  } & {
    id: string
    emoji: string
    userId: string
    messageId: string
  })[]
} & {
  author: {
    id: string
    name: string
    createdAt: Date
    email: string
    password: string
  }
}

type FriendRequest = {
  sender: {
    id: string
    name: string
    email: string
  }
  receiver: {
    id: string
    name: string
    email: string
  }
}

type Reaction = {
  user: {
    name: string
    id: string
    email: string
  }
} & {
  id: string
  emoji: string
  userId: string
  messageId: string
}
