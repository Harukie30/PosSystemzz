"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Shield, ShoppingCart, ChefHat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/apiService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

type UserRole = "admin" | "cashier" | "kitchen";

// Background images for each role - add your image paths here
// Place images in the public folder and reference them like: "/images/admin-bg.jpg"
const ROLE_BACKGROUNDS: Record<UserRole, string> = {
  admin: "/admin.jpg",      // Change to your admin background image
  cashier: "/cashier.jpg",   // Change to your cashier background image
  kitchen: "/kitchen.jpg",   // Change to your kitchen background image
};

// Fallback background if images are not set
const DEFAULT_BACKGROUND = "#fce7f3";

// Map role to carousel index
const ROLE_TO_INDEX: Record<UserRole, number> = {
  admin: 0,
  cashier: 1,
  kitchen: 2,
};

const INDEX_TO_ROLE: Record<number, UserRole> = {
  0: "admin",
  1: "cashier",
  2: "kitchen",
};

const ROLES: UserRole[] = ["admin", "cashier", "kitchen"];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [termsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [pageApi, setPageApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const isScrollingRef = useRef(false);

  // Auto-close error dialog after 2 seconds
  useEffect(() => {
    if (errorDialogOpen) {
      const timer = setTimeout(() => {
        setErrorDialogOpen(false);
        setErrorMessage("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [errorDialogOpen]);

  // Auto-close success dialog after 2 seconds and redirect
  useEffect(() => {
    if (successDialogOpen) {
      const timer = setTimeout(() => {
        setSuccessDialogOpen(false);
        // Redirect based on role after dialog closes
        if (userRole === "admin") {
          router.push("/dashboard");
        } else if (userRole === "cashier") {
          router.push("/cashier");
        } else {
          router.push("/kitchen");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successDialogOpen, userRole, router]);

  // Handle carousel API initialization
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      // Only update current if we're not programmatically scrolling
      if (!isScrollingRef.current) {
        setCurrent(api.selectedScrollSnap());
      }
    };

    api.on("select", onSelect);

    // Cleanup
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Initialize page carousel to correct position
  useEffect(() => {
    if (!pageApi) return;
    const initialIndex = ROLE_TO_INDEX[userRole];
    if (initialIndex !== undefined) {
      pageApi.scrollTo(initialIndex, false); // false = no animation on initial load
    }
  }, [pageApi, userRole]);

  // Scroll both carousels when role changes (from button clicks) - synchronized
  useEffect(() => {
    if (!api || !pageApi) return;
    const targetIndex = ROLE_TO_INDEX[userRole];
    const currentIndex = api.selectedScrollSnap();
    if (targetIndex !== undefined && targetIndex !== currentIndex) {
      isScrollingRef.current = true;
      // Scroll both carousels together
      api.scrollTo(targetIndex);
      pageApi.scrollTo(targetIndex);
      // Reset flag after a short delay
      setTimeout(() => {
        isScrollingRef.current = false;
        setCurrent(targetIndex);
      }, 100);
    }
  }, [userRole, api, pageApi]);

  // Update role when carousel changes (if user manually navigates carousel)
  useEffect(() => {
    // Only update role if the change wasn't initiated by a role change
    if (!isScrollingRef.current && current !== undefined && INDEX_TO_ROLE[current]) {
      const newRole = INDEX_TO_ROLE[current];
      // Only update if different to prevent loops
      if (newRole && newRole !== userRole) {
        setUserRole(newRole);
      }
    }
  }, [current, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 🎯 Using API service instead of mock
      const result = await apiService.auth.login(username, password, userRole);
      
      if (result.success && result.user) {
        // ✅ Login successful! Save user to localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // Show success dialog
        setSuccessDialogOpen(true);
        setIsLoading(false);
      } else {
        // ❌ Login failed - show error dialog
        setErrorMessage(result.error || "Login failed. Please check your credentials.");
        setErrorDialogOpen(true);
        setIsLoading(false);
      }
    } catch (error) {
      // Handle network errors or other issues
      console.error("Login error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setErrorDialogOpen(true);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundColor: DEFAULT_BACKGROUND,
      }}
    >
      {/* Page background carousel - matches card carousel movement */}
      <div className="absolute inset-0 overflow-hidden w-full h-full -z-0">
        <Carousel
          setApi={setPageApi}
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
            dragFree: false,
          }}
          className="absolute inset-0 w-full h-full"
        >
          <CarouselContent className="h-full -ml-0">
            {(Object.keys(ROLE_BACKGROUNDS) as UserRole[]).map((role) => (
              <CarouselItem key={role} className={cn(
                "pl-0 h-full",
                role === "admin" || role === "cashier" ? "basis-[120%] min-w-[120%]" : "basis-full"
              )}>
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${ROLE_BACKGROUNDS[role]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "100% center",
                    backgroundRepeat: "no-repeat",
                    filter: "blur(3px)",
                    transform: "scale(1.1)",
                    height: "100vh",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      {/* Fade overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-xl animate-pop-up relative overflow-hidden border-0 min-h-[600px]">
          {/* Carousel for background images - covers full card area */}
          <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden rounded-lg">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: false,
                skipSnaps: false,
                dragFree: false,
              }}
              className="absolute inset-0 w-full h-full"
            >
              <CarouselContent className="h-full -ml-0">
                {(Object.keys(ROLE_BACKGROUNDS) as UserRole[]).map((role) => (
                  <CarouselItem key={role} className="pl-0 basis-full h-full">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${ROLE_BACKGROUNDS[role]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        height: "100%",
                        minHeight: "600px",
                      }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Fade overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 -z-10 rounded-lg" />
          <CardHeader className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center mx-auto">
              <Image
                src="/biryani.gif"
                alt="POS System Logo"
                width={80}
                height={80}
                className="rounded-full"
                unoptimized
              />
            </div>
            <CardTitle className="text-3xl text-white drop-shadow-lg">POS System</CardTitle>
            <CardDescription className="text-white/90">Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label className="text-white">Login As</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={userRole === "admin" ? "default" : "outline"}
                    onClick={() => setUserRole("admin")}
                    className={cn(
                      "w-full transition-all duration-300",
                      userRole === "admin" && "bg-primary text-primary-foreground scale-105"
                    )}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant={userRole === "cashier" ? "default" : "outline"}
                    onClick={() => setUserRole("cashier")}
                    className={cn(
                      "w-full transition-all duration-300",
                      userRole === "cashier" && "bg-primary text-primary-foreground scale-105"
                    )}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cashier
                  </Button>
                  <Button
                    type="button"
                    variant={userRole === "kitchen" ? "default" : "outline"}
                    onClick={() => setUserRole("kitchen")}
                    className={cn(
                      "w-full transition-all duration-300",
                      userRole === "kitchen" && "bg-primary text-primary-foreground scale-105"
                    )}
                  >
                    <ChefHat className="mr-2 h-4 w-4" />
                    Kitchen
                  </Button>
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-0 bg-white"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-0 bg-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-0"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer text-white"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full bg-green-700" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPrivacyPolicyOpen(true)}
                className="hover:text-white/80 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="hidden sm:inline">•</span>
              <button 
                onClick={() => setTermsOfServiceOpen(true)}
                className="hover:text-white/80 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span className="hidden sm:inline">•</span>
              <button 
                onClick={() => setSupportOpen(true)}
                className="hover:text-white/80 transition-colors cursor-pointer"
              >
                Support
              </button>
            </div>
          </div>
          <p className="text-xs text-white/90">
            © 2025 POS System. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <Image
                  src="/file.gif"
                  alt="Error"
                  width={80}
                  height={80}
                  className="rounded-full"
                  unoptimized
                />
              </div>
              <DialogTitle className="text-2xl">Login Failed</DialogTitle>
              <DialogDescription className="text-base">
                {errorMessage}
              </DialogDescription>
              <p className="text-lg text-red-500 font-bold mt-1">
                Please try again
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <Image
                  src="/verified-file.gif"
                  alt="Success"
                  width={80}
                  height={80}
                  className="rounded-full"
                  unoptimized
                />
              </div>
              <DialogTitle className="text-2xl">Login Successful!</DialogTitle>
              <DialogDescription className="text-base">
                Welcome back! Redirecting you now...
              </DialogDescription>
              <p className="text-lg text-green-500 font-bold mt-1">
                Please wait
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyPolicyOpen} onOpenChange={setPrivacyPolicyOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full">
                <Image
                  src="/poli.gif"
                  alt="Privacy Policy"
                  width={73}
                  height={73}
                  className="rounded-full"
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold">Privacy Policy</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-1 py-4">
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  Information We Collect
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed">
                  We collect information that you provide directly to us, including your username, password, 
                  and role when you log into our POS system. We also collect usage data to improve our services.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  How We Use Your Information
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  authenticate users, and ensure system security.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  Data Security
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                  Your Rights
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed">
                  You have the right to access, update, or delete your personal information. 
                  Please contact support for assistance.
                </p>
              </section>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button onClick={() => setPrivacyPolicyOpen(false)} className="w-full sm:w-auto">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={termsOfServiceOpen} onOpenChange={setTermsOfServiceOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using this POS system, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">2. Use License</h3>
              <p className="text-muted-foreground">
                Permission is granted to use this system for business purposes. You may not modify, 
                copy, or redistribute the software without permission.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">3. User Responsibilities</h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">4. Prohibited Uses</h3>
              <p className="text-muted-foreground">
                You may not use the system for any unlawful purpose or to violate any laws, 
                or to transmit any malicious code or viruses.
              </p>
            </section>
          </div>
          <DialogFooter>
            <Button onClick={() => setTermsOfServiceOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Support</DialogTitle>
            <DialogDescription>
              Need help? We're here for you!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-2">Contact Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Email:</strong> support@possystem.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">Common Issues</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Forgot your password? Contact your administrator</li>
                <li>Login issues? Verify your role selection</li>
                <li>System errors? Check your internet connection</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSupportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


