// SidebarContext.tsx
import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setIsExpanded((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem("sidebar-expanded", JSON.stringify(newState));
      return newState;
    });
  };

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}