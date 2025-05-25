import { auth } from "@/auth"

export default auth((req) => {
  // req.auth contains the session information
  console.log("[MIDDLEWARE] Processing request:", req.nextUrl.pathname);
  console.log("[MIDDLEWARE] User authenticated:", !!req.auth);
  
  // The middleware automatically handles authentication
  // Dynamic routes will now work properly with authentication
  
  // You can add custom logic here if needed
  // For example, role-based access control:
  // if (req.nextUrl.pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {
  //   return NextResponse.redirect(new URL('/unauthorized', req.url))
  // }
  
  // Let the request continue
  return;
})

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (auth routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}