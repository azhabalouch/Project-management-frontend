import type { ReactNode } from 'react';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Shared Page Layout
 * Wraps page content with the Side and Top navigation bars.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
      <SideNavigation />
      <main className='flex-1 flex flex-col relative min-w-0'>
        <TopNavigation />
        {children}
      </main>
    </div>
  );
}