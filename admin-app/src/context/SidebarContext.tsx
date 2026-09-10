import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  isPinned: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  togglePin: () => void;
  setHovered: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('em-sidebar-pinned');
    if (saved !== null) {
      setIsPinned(saved === 'true');
    }
  }, []);

  const toggleMobile = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setIsOpen(false), []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem('em-sidebar-pinned', String(next));
      return next;
    });
  }, []);

  const setHoveredCb = useCallback((v: boolean) => setIsHovered(v), []);

  const isExpanded = isPinned || isHovered;

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleMobile,
        closeMobile,
        isPinned,
        isHovered,
        isExpanded,
        togglePin,
        setHovered: setHoveredCb,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
