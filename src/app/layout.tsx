import type { Metadata } from "next"
import "./globals.css"
import { Poppins } from "next/font/google"
import { Inter } from "next/font/google"
import Head from "next/head"

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
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="chatty" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={`${poppins.className} ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
