import React from 'react';
import './globals.css';

export const metadata = {
  title: 'CodeMind — NexaTech Solutions',
  description: 'Moteur de Recherche Sémantique de Code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#f6f8fb] text-[#142938] min-h-screen">
        {children}
      </body>
    </html>
  );
}