"use client";

import { MainLayout } from "./main-layout";

interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function DashboardShell({
  title,
  description,
  children,
  headerAction,
}: DashboardShellProps) {
  return (
    <MainLayout>
      <div className="space-y-6 relative">
        {/* Header */}
        <div className={headerAction ? "flex items-center justify-between" : ""}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </MainLayout>
  );
}

