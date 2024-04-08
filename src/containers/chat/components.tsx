"use client"

import { FC } from "react"
import { FaPlus } from "react-icons/fa"
import { createChat, sendMessage } from "@/actions/chat"
import { useState, useEffect } from "react"

const Button: FC<{ userId: string }> = ({ userId }) => {
  return (
    <button
      onClick={() => createChat(userId)}
      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-neutral bg-opacity-80 text-xl text-text text-opacity-70 hover:bg-text hover:bg-opacity-10"
    >
      <FaPlus />
    </button>
  )
}

const DateFormat: FC<{ date: Date }> = ({ date }) => {
  const formatTime = (date: Date) => {
    const diffMilliseconds = Date.now() - date.getTime()
    const diffSeconds = Math.floor(diffMilliseconds / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffYears = Math.floor(diffDays / 365)

    if (diffYears > 0) {
      return `${diffYears}y`
    } else if (diffWeeks > 0) {
      return `${diffWeeks}w`
    } else if (diffDays > 0) {
      return `${diffDays}d`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`
    } else {
      return `Now`
    }
  }

  const [formattedTime, setFormattedTime] = useState(() => formatTime(date))

  useEffect(() => {
    const interval = setInterval(
      () => {
        setFormattedTime(formatTime(date))
      },
      60000,
      date
    )

    return () => clearInterval(interval)
  }, [date])

  useEffect(() => {
    setFormattedTime(formatTime(date))
  }, [date])

  return <h4 className="text-lg">{formattedTime}</h4>
}

interface InputProps {
  placeholder: string
  small?: boolean
  chatId?: string
  userId?: string
}

const Input: FC<InputProps> = ({ placeholder, small, chatId, userId }) => {
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = String(formData.get("text")).trim()

    if (chatId && userId && text) {
      sendMessage(chatId, userId, text)
    }

    e.currentTarget.reset()
  }

  return (
    <form onSubmit={(e) => handleSendMessage(e)}>
      <input
        placeholder={placeholder}
        name="text"
        className={`h-12 ${small ? "w-64" : "w-[768px]"} focus:bg-opacity-10" rounded-xl bg-neutral bg-opacity-80 px-4 text-base text-text outline-0 focus:bg-text focus:bg-opacity-10`}
        autoComplete="off"
      />
    </form>
  )
}

export { Button, DateFormat, Input }
