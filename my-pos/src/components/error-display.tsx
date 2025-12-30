/**
 * 🚨 ERROR DISPLAY COMPONENT
 * 
 * Reusable error display component with retry functionality
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  retryLabel = "Try Again",
  className 
}: ErrorDisplayProps) {
  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {retryLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

