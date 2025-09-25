import type { Metadata } from "next"
import "./globals.css"
import { Poppins } from "next/font/google"
import { Inter } from "next/font/google"

export const metadata: Metadata = {
  title: "chatty",
  description: "a chat app",
}

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] })
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
