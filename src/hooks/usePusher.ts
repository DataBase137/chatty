"use client"

import { useEffect, useRef } from "react"
import { getPusherClient } from "@/lib/pusher"

type EventCallback = (data: any) => void

interface Subscription {
  channelName: string
  events: Map<string, EventCallback>
}

export const usePusher = () => {
  const pusher = getPusherClient()
  const subscriptions = useRef<Map<string, Subscription>>(new Map())

  const subscribe = (
    channelName: string,
    event: string,
    callback: EventCallback
  ) => {
    let sub = subscriptions.current.get(channelName)

    if (!sub) {
      const channel = pusher.subscribe(channelName)
      sub = { channelName, events: new Map() }
      subscriptions.current.set(channelName, sub)
    }

    if (!sub.events.has(event)) {
      const channel = pusher.channel(channelName)
      if (channel) {
        channel.bind(event, callback)
        sub.events.set(event, callback)
      }
    }
  }

  const unsubscribe = (channelName: string, event?: string) => {
    const sub = subscriptions.current.get(channelName)
    if (!sub) return

    const channel = pusher.channel(channelName)
    if (!channel) return

    if (event) {
      const cb = sub.events.get(event)
      if (cb) {
        channel.unbind(event, cb)
        sub.events.delete(event)
      }
    } else {
      sub.events.forEach((cb, e) => channel.unbind(e, cb))
      pusher.unsubscribe(channelName)
      subscriptions.current.delete(channelName)
    }
  }

  return { subscribe, unsubscribe }
}
