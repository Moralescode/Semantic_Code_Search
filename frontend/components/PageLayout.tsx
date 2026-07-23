import React from 'react';
import Header from './Header';

export default function PageLayout({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {(title || subtitle) && (
          <section className="mck-section border-b border-[#e3e8ee] bg-white">
            <div className="mck-container">
              {title && <h1 className="mck-heading">{title}</h1>}
              {subtitle && <p className="mck-subheading mt-2">{subtitle}</p>}
            </div>
          </section>
        )}
        <div className="mck-container">{children}</div>
      </main>
      <footer className="border-t border-[#e3e8ee] bg-white">
        <div className="mck-container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
          <div className="text-sm text-[#5b6b7a]">CodeMind — NexaTech Solutions · Abidjan, Côte d&apos;Ivoire</div>
          <div className="text-xs text-[#5b6b7a]">Plateforme sémantique de recherche de code</div>
        </div>
      </footer>
    </div>
  );
}