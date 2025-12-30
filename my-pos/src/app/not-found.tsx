"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, AlertTriangle, X, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-destructive/10 to-destructive/5 p-4 relative overflow-hidden">
      {/* Abstract Error Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Error Icons */}
        <div className="absolute top-20 left-10 text-destructive/10 animate-float">
          <AlertTriangle className="w-32 h-32" />
        </div>
        <div className="absolute top-40 right-20 text-destructive/10 animate-float-delayed">
          <X className="w-24 h-24" />
        </div>
        <div className="absolute bottom-32 left-20 text-destructive/10 animate-float-slow">
          <AlertCircle className="w-28 h-28" />
        </div>
        <div className="absolute bottom-20 right-10 text-destructive/10 animate-float">
          <AlertTriangle className="w-20 h-20" />
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-destructive/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Broken Lines Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="broken-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 L30,50 M70,50 L100,50" stroke="currentColor" strokeWidth="2" className="text-destructive" />
              <path d="M50,0 L50,30 M50,70 L50,100" stroke="currentColor" strokeWidth="2" className="text-destructive" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#broken-lines)" />
        </svg>
      </div>
      
      <Card className="w-full max-w-md animate-pop-up relative z-10 backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <Image
              src="/error.gif"
              alt="404 Error"
              width={128}
              height={128}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>        
            <CardDescription className="text-lg text-destructive font-bold">
              Page Not Found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-black font-bold">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full">
              <Link href="/login">
                <Home className="w-4 h-4 mr-2" />
                Go to Login
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              Need help? Try these pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cashier">Cashier</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">Products</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

