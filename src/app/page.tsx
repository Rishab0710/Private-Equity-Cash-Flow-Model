'use client';

/**
 * Root entry point for the application.
 * Redirects to the Assumptions Studio (Home) located in the (app) route group.
 */
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}
