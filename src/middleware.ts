import { NextRequest, NextResponse } from "next/server"
import { logOut, verifyAuth } from "@/actions/auth"

export const middleware = async (req: NextRequest) => {
  const token = req.cookies.get("token")?.value
  const publicPaths = ["/", "/login", "/signup"]
  const res = NextResponse.next()

  if (!token) {
    if (!publicPaths.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return res
  }

  const verified = await verifyAuth(token)

  if (verified && publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/c", req.url))
  }

  if (!verified) {
    logOut()
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
