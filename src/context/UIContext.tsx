import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

interface UIContextValue {
  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen(v => !v);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <UIContext.Provider value={{ mobileNavOpen, toggleMobileNav, closeMobileNav }}>
      {children ?? <Outlet />}
    </UIContext.Provider>
  );
};

export const useUIContext = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used within UIProvider');
  return ctx;
};

export default UIContext;
