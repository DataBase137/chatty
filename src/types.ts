type Chat = {
  id: string
  name: string | null
  isGroup: boolean
  createdAt: Date
  lastMessageAt: Date
} & {
  participants: {
    id: string
    name: string
    email: string
    password: string
    createdAt: Date
  }[]
} & {
  messages:
    | {
        id: string
        text: string | null
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
} & {
  author: {
    id: string
    name: string
    avatarUrl: string | null
    createdAt: Date
    email: string
    password: string
  }
}

type User = {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
  avatarUrl: string | null
} & {
  friends: {
    id: string
    name: string
    email: string
    password: string
    createdAt: Date
    avatarUrl: string | null
  }[]
}
