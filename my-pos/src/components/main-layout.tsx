"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

