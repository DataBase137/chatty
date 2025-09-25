import Pusher from "pusher-js"

let pusher: Pusher | null = null

export function getPusherClient() {
  if (!pusher) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "us3",
      forceTLS: true,
    })
  }
  return pusher
}
