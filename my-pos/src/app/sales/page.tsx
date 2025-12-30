"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Download, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/apiService";
import type { Transaction } from "@/lib/api/types";
import { ErrorDisplay } from "@/components/error-display";

type TimePeriod = "day" | "week" | "month" | "year";

interface SalesLineItem {
  id: string;
  date: string;
  time: string;
  product: string;
  quantity: number;
  amount: number;
}

export default function SalesPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions on mount and when time period changes
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on time period
      const now = new Date();
      let startDate: Date;
      
      switch (timePeriod) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      const endDate = new Date(now);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await apiService.transactions.getByDateRange(startDateStr, endDateStr);
      
      if (response.success && response.transactions) {
        setTransactions(response.transactions);
      } else {
        setError(response.error || "Failed to load transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [timePeriod]);

  // Transform transactions into line items for display
  const lineItems: SalesLineItem[] = transactions.flatMap((transaction) =>
    transaction.items.map((item, index) => ({
      id: `${transaction.id}-${index}`,
      date: transaction.date,
      time: transaction.time,
      product: item.name,
      quantity: item.quantity,
      amount: item.price * item.quantity,
    }))
  );

  // Calculate totals
  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const count = transactions.length;
  const averageSale = count > 0 ? total / count : 0;
  
  // Filter line items based on search query
  const filteredTransactions = lineItems.filter((item) =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  if (isLoading) {
    return (
      <DashboardShell
        title="Sales"
        description="View and manage sales transactions"
        headerAction={
          <Button disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      >
        {/* Time Period Selector Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Summary Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sales Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Sales"
      description="View and manage sales transactions"
      headerAction={
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      }
    >

        {/* Time Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Time Period</CardTitle>
            <CardDescription>Select a time period to view sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {timePeriods.map((period) => (
                <Button
                  key={period.value}
                  variant={timePeriod === period.value ? "default" : "outline"}
                  onClick={() => setTimePeriod(period.value)}
                  className={cn(
                    timePeriod === period.value && "bg-primary text-primary-foreground"
                  )}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {timePeriods.find((p) => p.value === timePeriod)?.label}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Badge variant="secondary">{count}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {timePeriods.find((p) => p.value === timePeriod)?.label}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{averageSale.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={fetchTransactions}
          />
        )}

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Transactions</CardTitle>
                <CardDescription>
                  All sales for {timePeriods.find((p) => p.value === timePeriod)?.label.toLowerCase()}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.date}</div>
                          <div className="text-sm text-muted-foreground">{transaction.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.product}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {error ? "Error loading transactions" : "No transactions found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </DashboardShell>
  );
}

