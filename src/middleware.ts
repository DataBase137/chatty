import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/actions/auth"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    if (req.nextUrl.pathname === "/chat") {
      return NextResponse.redirect(new URL("/login", req.url))
    } else {
      return NextResponse.next()
    }
  }

  const verified = await verifyAuth(token)

  if (req.nextUrl.pathname != "/chat" && verified) {
    return NextResponse.redirect(new URL("/chat", req.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
