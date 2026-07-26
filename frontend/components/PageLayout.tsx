import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

export default function PageLayout({
  children,
  title,
  subtitle,
  hideHeader,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
}) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {!hideHeader && (
          <Header title={title} subtitle={subtitle} />
        )}
        <main className="app-main-content">
          {title && hideHeader && (
            <div className="bd-page-header">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
