'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PageLoadingState } from '@/components/LoadingSpinner';

const PUBLIC_ROUTES = ['/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Always allow public routes (login page)
      if (PUBLIC_ROUTES.includes(pathname)) {
        setAuthorized(true);
        return;
      }

      // Check if user is logged in
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.replace('/');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (!user.name || !user.role) {
          localStorage.removeItem('user');
          router.replace('/');
          return;
        }
      } catch {
        localStorage.removeItem('user');
        router.replace('/');
        return;
      }

      setAuthorized(true);
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized && !PUBLIC_ROUTES.includes(pathname)) {
    return <PageLoadingState />;
  }

  return <>{children}</>;
}

