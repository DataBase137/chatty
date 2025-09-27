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
  parentId: string | null

  author: {
    id: string
    name: string
    email: string
  }

  reactions: {
    id: string
    emoji: string
    userId: string
    messageId: string
    user: {
      id: string
      name: string
      email: string
    }
  }[]

  parent: {
    id: string
    text: string
    chatId: string
    createdAt: Date
    authorId: string
    author: {
      id: string
      name: string
      email: string
    }
  } | null
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

type Friend = {
  id: string
  name: string
  email: string
}
