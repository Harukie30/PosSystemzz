/**
 * 🔐 WITH AUTH HOC (Higher Order Component)
 * 
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * 
 * Usage:
 * export default withAuth(DashboardPage);
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/lib/api/types";

interface WithAuthProps {
  [key: string]: any;
}

export function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      // Check if user is logged in (check localStorage)
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          router.push("/login");
        }
      } else {
        // No user found, redirect to login
        router.push("/login");
      }
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Checking authentication...</p>
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

