import React from 'react';
import './globals.css';
import { I18nProvider } from '@/lib/I18nContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthGuard } from '@/lib/AuthGuard';

export const metadata = {
  title: 'CodeMind — NexaTech Solutions',
  description: 'Moteur de Recherche Sémantique de Code',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
