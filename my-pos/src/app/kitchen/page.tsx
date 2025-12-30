"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { withRole } from "@/components/hoc";
import type { User, Transaction } from "@/lib/api/types";
import { apiService } from "@/lib/api/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Clock, ChefHat, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

function KitchenPage({ user }: { user?: User }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "preparing" | "completed">("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Load orders from API and set up auto-refresh
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.transactions.getAll();
        
        if (response.success && response.transactions) {
          // Filter only transactions with kitchenStatus (kitchen orders)
          // Sort by timestamp (newest first)
          const sortedOrders = response.transactions
            .filter(t => t.kitchenStatus !== undefined)
            .sort((a, b) => b.timestamp - a.timestamp);
          setOrders(sortedOrders);
        } else {
          setError(response.error || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    // Load immediately
    loadOrders();

    // Auto-refresh every 3 seconds
    const interval = setInterval(loadOrders, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, status: "preparing" | "completed") => {
    try {
      const response = await apiService.transactions.updateKitchenStatus(orderId, status);
      
      if (response.success && response.transaction) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, kitchenStatus: status }
              : order
          ).sort((a, b) => b.timestamp - a.timestamp)
        );
      } else {
        console.error("Failed to update order status:", response.error);
        setError(response.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError(error instanceof Error ? error.message : "Failed to update order status");
    }
  };

  // Calculate time since order was placed
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Auto-close logout dialog after 2 seconds and redirect
  useEffect(() => {
    if (logoutDialogOpen) {
      const timer = setTimeout(() => {
        setLogoutDialogOpen(false);
        // Clear user data from localStorage
        localStorage.removeItem("user");
        router.push("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [logoutDialogOpen, router]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call logout API
      await apiService.auth.logout();
      
      // Show success dialog
      setIsLoggingOut(false);
      setLogoutDialogOpen(true);
    } catch (error) {
      // Even if API fails, still logout locally
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      setLogoutDialogOpen(true);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.kitchenStatus === filter;
  });

  // Count orders by status
  const preparingCount = orders.filter((o) => o.kitchenStatus === "preparing").length;
  const completedCount = orders.filter((o) => o.kitchenStatus === "completed").length;

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 p-6">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-9 w-64" />
            </div>
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Stats and Filters Skeleton */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-24 rounded-lg" />
              <Skeleton className="h-16 w-24 rounded-lg" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Skeleton className="h-9 w-20 rounded" />
              <Skeleton className="h-9 w-24 rounded" />
              <Skeleton className="h-9 w-24 rounded" />
            </div>
          </div>

          {/* Orders Grid Skeleton */}
          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      {/* Timer */}
                      <Skeleton className="h-4 w-16" />
                      {/* Items */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-12 w-full rounded" />
                        <Skeleton className="h-12 w-full rounded" />
                      </div>
                      {/* Total */}
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                      {/* Button */}
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
            </div>
            <p className="text-gray-600">Manage incoming orders</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <>
                <Spinner size="sm" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </div>

        {/* Stats and Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">Preparing</p>
              <p className="text-2xl font-bold text-yellow-900">{preparingCount}</p>
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({orders.length})
            </Button>
            <Button
              variant={filter === "preparing" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("preparing")}
            >
              Preparing ({preparingCount})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed ({completedCount})
            </Button>
          </div>
        </div>

        {/* Orders Grid */}
        <ScrollArea className="flex-1 pr-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ChefHat className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-2">
                {filter === "all"
                  ? "Orders will appear here when customers place orders"
                  : `No ${filter} orders at the moment`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
              {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`transition-all ${
                  order.kitchenStatus === "preparing"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-green-400 bg-green-50"
                }`}
              >
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order #{order.receiptNumber}</p>
                      <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                    </div>
                    <Badge
                      variant={order.kitchenStatus === "preparing" ? "secondary" : "default"}
                      className={
                        order.kitchenStatus === "preparing"
                          ? "bg-yellow-200 text-yellow-900"
                          : "bg-green-200 text-green-900"
                      }
                    >
                      {order.kitchenStatus === "preparing" ? (
                        <>
                          <Clock className="mr-1 h-3 w-3" />
                          Preparing
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Timer */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      {getTimeAgo(order.timestamp)}
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-white p-2 rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">₱{item.price.toFixed(2)} each</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          x{item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₱{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {order.kitchenStatus === "preparing" ? (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    ) : (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Preparing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Logout Success Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <Image
                  src="/logout.gif"
                  alt="Logout"
                  width={80}
                  height={80}
                  className="rounded-full"
                  unoptimized
                />
              </div>
              <DialogTitle className="text-2xl">Logged Out Successfully!</DialogTitle>
              <DialogDescription className="text-base">
                You have been logged out. Redirecting to login page...
              </DialogDescription>
              <p className="text-lg text-blue-500 font-bold mt-1">
                Please wait
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Protect kitchen page - only admin and kitchen can access
export default withRole(KitchenPage, ['admin', 'kitchen']);
