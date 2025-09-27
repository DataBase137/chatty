import { NextRequest, NextResponse } from "next/server"
import { getUser, logOut } from "@/actions/auth"
import { User } from "@prisma/client"

export const middleware = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value
  const publicPaths = ["/", "/login", "/signup"]
  const pathname = req.nextUrl.pathname

  const reqHeaders = new Headers(req.headers)
  reqHeaders.set("x-pathname", pathname)

  const res = NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  })

  if (!token) {
    if (!publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return res
  }

  const user = await getUser()

  if (!user && token) {
    logOut()
  }

  if (user && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/c", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
