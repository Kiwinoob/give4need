"use client"; // Mark this component as a client-side component

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/app/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "./icons";
import { db } from "@/app/firebase"; // Import your Firebase setup
import { doc, setDoc } from "firebase/firestore";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!name || !email || !password) {
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

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Update the user's profile with the name
      await updateProfile(userCredential.user, { displayName: name });

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
      });

      // Show a success toast
      toast.success("Registration successful!");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">Name</Label>
          <Input
            id="first-name"
            placeholder="Max"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </div>
    </form>
  );
}
