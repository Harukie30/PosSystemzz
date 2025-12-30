"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Download, TrendingUp, TrendingDown, DollarSign, Package, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/apiService";
import type { SalesReport, InventoryAlert, FastMovingProduct } from "@/lib/api/reports";
import { ErrorDisplay } from "@/components/error-display";

type ReportPeriod = "day" | "week" | "month" | "year";

export default function ReportsPage() {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<{
    lowStock: InventoryAlert[];
    outOfStock: InventoryAlert[];
    fastMoving: FastMovingProduct[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports data
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch sales report and inventory alerts in parallel
      const [salesData, inventoryData] = await Promise.all([
        apiService.reports.getSalesReport(reportPeriod),
        apiService.reports.getInventoryAlerts(),
      ]);
      
      setSalesReport(salesData);
      setInventoryAlerts(inventoryData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportPeriod]);

  const currentReport = salesReport || {
    totalSales: 0,
    totalTransactions: 0,
    topProducts: [],
  };
  
  const inventoryReport = inventoryAlerts || {
    lowStock: [],
    outOfStock: [],
    fastMoving: [],
  };
  const periodLabels = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  if (isLoading) {
    return (
      <DashboardShell
        title="Reports"
        description="Detailed analytics and insights"
        headerAction={
          <Button disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      >
        {/* Period Selector Skeleton */}
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

        {/* Top Products Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Reports Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Reports"
      description="Detailed analytics and insights"
      headerAction={
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      }
    >
      {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
            <CardDescription>Select a time period for the report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {Object.entries(periodLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={reportPeriod === value ? "default" : "outline"}
                  onClick={() => setReportPeriod(value as ReportPeriod)}
                  className={cn(
                    reportPeriod === value && "bg-primary text-primary-foreground"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={fetchReports}
          />
        )}

        {/* Sales Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{currentReport.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {periodLabels[reportPeriod]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentReport.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {periodLabels[reportPeriod]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{currentReport.totalTransactions > 0 
                  ? (currentReport.totalSales / currentReport.totalTransactions).toFixed(2)
                  : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Report */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products for {periodLabels[reportPeriod].toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentReport.topProducts.map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell className="font-medium">
                      ₱{product.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Inventory Reports */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryReport.lowStock.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryReport.lowStock.map((product) => (
                      <TableRow key={product.name}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{product.currentStock}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Min: {product.minThreshold}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No low stock items
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fast Moving Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fast Moving Products
              </CardTitle>
              <CardDescription>Products with highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Sales Count</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.fastMoving.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="default">{product.salesCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
    </DashboardShell>
  );
}

