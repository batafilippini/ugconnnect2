import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/auth/")

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return res
  }

  // Crear cliente de Supabase para el middleware
  const supabase = createMiddlewareClient({ req, res })

  // Verificar si hay una sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión y no es una ruta pública, redirigir a login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
