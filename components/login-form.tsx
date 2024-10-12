"use client"; // Mark this component as a client-side component
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/app/firebase";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("All fields are required.");
      setIsLoading(false);
      toast.error("All fields are required.");
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Invalid email address.");
      setIsLoading(false);
      toast.error("Invalid email address.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get the ID token
      const idToken = await user.getIdToken();

      // Store the ID token in a cookie
      document.cookie = `auth-token=${idToken}; expires=${new Date(
        Date.now() + 86400 * 30 // 30 days in milliseconds
      ).toUTCString()}; path=/; ${
        process.env.NODE_ENV === "production" ? "Secure; " : ""
      }SameSite=Lax`;

      // Show a success toast
      toast.success("Successfully logged in.", {
        description:
          "Your sign in request was successful. You will be redirected shortly.",
      });
      const redirect = searchParams.get("redirect");
      // Redirect to the dashboard or homepage
      router.replace(redirect ? redirect : "/");
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred.";
      console.log(errorMessage);
      setError(errorMessage);
      toast.error("Failed to login", {
        description:
          "Your sign in request failed. Please check email or password are incorrect",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="ml-auto inline-block text-sm underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className={cn(buttonVariants())}
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In with Email
        </Button>
      </div>
    </form>
  );
}
