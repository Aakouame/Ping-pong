import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import CheckUserStatus from "./app/api/checkUserStatus";
import { loginStatus } from "./app/utils/library/authEnum";
import { useUserContext } from "./app/components/useUserContext";
import { UserType } from "./app/types/goodloginType";
import getUserStatus from "./app/api/auth/getUserStatus";

async function goodLoginMiddleware() {}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

  const cookie = request.cookies.get("connect.sid");
  if (cookie && request.nextUrl.pathname === "/") {
    const responseStatus = await CheckUserStatus(cookie.value);
    const data = await responseStatus.json();
    if (data.message === loginStatus.FirstTime) {
      
      return NextResponse.redirect(new URL("/auth/goodlogin", request.url));
    } else if (data.message === loginStatus.TwoFactor) {
      
      return NextResponse.redirect(new URL("/auth/twofactor", request.url));
    } else if (data.message === loginStatus.NotLogged) {
      
      return NextResponse.redirect(new URL("/auth", request.url));
    } else {
      
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } if (cookie && request.nextUrl.pathname === "/auth/goodlogin") {
    const responseStatus = await CheckUserStatus(cookie.value);
    const data = await responseStatus.json();
    if (data.message === loginStatus.FirstTime) {
      
      return NextResponse.next();
    } else if (data.message === loginStatus.TwoFactor) {
     
      return NextResponse.redirect(new URL("/auth/twofactor", request.url));
    } else {
      
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } else if (cookie && request.nextUrl.pathname === "/auth/twofactor") {
    const responseStatus = await CheckUserStatus(cookie.value);
    const data = await responseStatus.json();
    if (data.message === loginStatus.FirstTime) {
     
      return NextResponse.redirect(new URL("/auth/goodlogin", request.url));
    } else if (data.message === loginStatus.TwoFactor) {
      
      return NextResponse.next();
    } else {
      
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } else if (cookie && request.nextUrl.pathname === "/auth") {
    const responseStatus = await CheckUserStatus(cookie.value);
    const data = await responseStatus.json();
   
    if (data.message === loginStatus.FirstTime) {
      
      return NextResponse.redirect(new URL("/auth/goodlogin", request.url));
    } else if (data.message === loginStatus.TwoFactor) {
     
      return NextResponse.redirect(new URL("/auth/twofactor", request.url));
    } else if (data.message === loginStatus.NotLogged) {
     
      return NextResponse.next();
    } else {
    
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } else if (!cookie && request.nextUrl.pathname === "/auth") {
    
    return NextResponse.next();
  } else if(cookie && request.nextUrl.pathname !== "/auth") {
    const responseStatus = await CheckUserStatus(cookie.value);
    const data = await responseStatus.json();
    if (data.message === loginStatus.FirstTime) {
     
      return NextResponse.redirect(new URL("/auth/goodlogin", request.url));
    } else if (data.message === loginStatus.TwoFactor) {
    
      return NextResponse.redirect(new URL("/auth/twofactor", request.url));
    } else if (data.message === loginStatus.NotLogged) {
      
      return NextResponse.redirect(new URL("/auth", request.url));
    } else {
      
      return NextResponse.next();
    }
  } else if (!cookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: [
    '/',
    "/profile/:path*",
    "/chat",
    "/game/:path*",
    "/settings",
    "/auth/:path*",
  ],
};
