"use client"; // Mark this component as a client-side component
import { cn } from "@/lib/utils";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setError("Email is required.");
      setIsLoading(false);
      toast.error("Email is required.");
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
      await sendPasswordResetEmail(auth, email);
      toast.success("Check your email.", {
        description:
          "We sent you a password reset link. Be sure to check your spam too.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage || "Something went wrong.", {
        description: "Make sure you entered the correct email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
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
        <div className="grid gap-2"></div>
        <Button
          type="submit"
          className={cn(buttonVariants())}
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Email
        </Button>
      </div>
    </form>
  );
}
