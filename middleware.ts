// Temporarily disabled middleware to test dynamic routes
// import { auth } from "@/auth"
// import { NextResponse } from "next/server"

// export default auth((req) => {
//   // Skip middleware for all API routes - let them handle their own auth
//   if (req.nextUrl.pathname.startsWith('/api/')) {
//     return NextResponse.next();
//   }
  
//   // req.auth contains the session information for non-API routes
//   console.log("[MIDDLEWARE] Processing request:", req.nextUrl.pathname);
//   console.log("[MIDDLEWARE] User authenticated:", !!req.auth);
  
//   // The middleware handles authentication for pages only
//   // API routes use their own authentication via authenticateDynamicRoute()
  
//   // Let the request continue
//   return NextResponse.next();
// })

// export const config = {
//   matcher: [
//     // Match all request paths except for the ones starting with:
//     // - _next/static (static files)
//     // - _next/image (image optimization files)
//     // - favicon.ico (favicon file)
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// }