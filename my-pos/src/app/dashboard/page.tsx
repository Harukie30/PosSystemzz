"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { withRole } from "@/components/hoc";
import type { User } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { apiService } from "@/lib/api/apiService";
import type { DashboardStats, Transaction } from "@/lib/api/types";
import { ErrorDisplay } from "@/components/error-display";

function DashboardPage({ user }: { user?: User }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [productMovements, setProductMovements] = useState({ in: 0, out: 0, net: 0 });

  // 🎯 Fetch dashboard data from API
  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.dashboard.getDashboard();
      
      if (response.success && response.stats) {
        setSalesData(response.stats);
        setRecentTransactions(response.recentTransactions || []);
        setProductMovements(response.stats.productMovements);
      } else {
        setError(response.error || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell
        title="Dashboard"
        description="Overview of your store"
      >
        {/* Sales Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Movements & Recent Transactions Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Product Movements Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Dashboard"
      description="Overview of your store"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "url('/admin.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
          opacity: 0.2,
        }}
      />
      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={fetchDashboard}
        />
      )}

      {/* Sales Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Today's Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{salesData?.today.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {salesData?.today.transactions || 0} transactions
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesData?.today.change ? (salesData.today.change > 0 ? "+" : "") + salesData.today.change + "%" : "0%"}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Week's Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{salesData?.week.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {salesData?.week.transactions || 0} transactions
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesData?.week.change ? (salesData.week.change > 0 ? "+" : "") + salesData.week.change + "%" : "0%"}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Month's Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{salesData?.month.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {salesData?.month.transactions || 0} transactions
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesData?.month.change ? (salesData.month.change > 0 ? "+" : "") + salesData.month.change + "%" : "0%"}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Year's Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{salesData?.year.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {salesData?.year.transactions || 0} transactions
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesData?.year.change ? (salesData.year.change > 0 ? "+" : "") + salesData.year.change + "%" : "0%"}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">vs last year</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Movements & Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Product Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Product Movements</CardTitle>
              <CardDescription>Products in and out of store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Products In</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{productMovements.in}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Products Out</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{productMovements.out}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net Change</span>
                    <Badge variant={productMovements.net >= 0 ? "default" : "destructive"}>
                      {productMovements.net >= 0 ? "+" : ""}{productMovements.net}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest sales from today</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.slice(0, 5).map((transaction) => (
                      transaction.items.map((item, idx) => (
                        <TableRow key={`${transaction.id}-${idx}`}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">₱{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )).flat()
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        No recent transactions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
    </DashboardShell>
  );
}

// Protect dashboard - only admin can access
export default withRole(DashboardPage, ['admin']);

