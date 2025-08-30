import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check for maintenance mode using the API
  try {
    const maintenanceUrl = new URL('/api/maintenance', request.url);
    const maintenanceResponse = await fetch(maintenanceUrl.toString());
    
    if (maintenanceResponse.ok) {
      const data = await maintenanceResponse.json();
      
      // If maintenance mode is enabled and not accessing allowed paths
      if (data.maintenanceMode && 
          !path.startsWith('/api/') && 
          !path.startsWith('/admin') && 
          path !== '/maintenance' && 
          path !== '/login') {
        
        // Redirect to maintenance page
        console.log(`Maintenance mode active, redirecting ${path} to /maintenance`);
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Continue with normal flow if maintenance check fails
  }

  if (path.startsWith('/admin') || path.startsWith('/profile')) {
    const hasSession = request.cookies.has('next-auth.session-token') || 
                       request.cookies.has('__Secure-next-auth.session-token') ||
                       request.cookies.has('token');
    
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)']
} 