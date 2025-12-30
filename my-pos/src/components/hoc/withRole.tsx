/**
 * 🛡️ WITH ROLE HOC (Higher Order Component)
 * 
 * Protects routes based on user role
 * Only allows specific roles to access the component
 * 
 * Usage:
 * export default withRole(DashboardPage, ['admin']);
 * export default withRole(CashierPage, ['admin', 'cashier']);
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { apiService } from "@/lib/api/apiService";
import type { User, UserRole } from "@/lib/api/types";

interface WithRoleProps {
  [key: string]: any;
}

export function withRole<P extends WithRoleProps>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function RoleProtectedComponent(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      // Check if user is logged in and has correct role
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Check if user role is allowed
          if (allowedRoles.includes(userData.role)) {
            setUser(userData);
            setIsLoading(false);
          } else {
            // User doesn't have required role, redirect to their dashboard
            if (userData.role === "admin") {
              router.push("/dashboard");
            } else if (userData.role === "cashier") {
              router.push("/cashier");
            } else {
              router.push("/kitchen");
            }
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          router.push("/login");
        }
      } else {
        // No user found, redirect to login
        router.push("/login");
      }
    }, [router, allowedRoles]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect
    }

    // Pass user as prop to component
    return <Component {...props} user={user} />;
  };
}

