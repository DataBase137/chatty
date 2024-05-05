type Chat = {
  id: string
  name: string
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
} & {
  author: {
    id: string
    name: string
    createdAt: Date
    email: string
    password: string
  }
}
