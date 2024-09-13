"use client"; // Mark this component as a client-side component

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProgressBarLink } from "@/components/progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/app/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function UserNav() {
  const [profile, setProfile] = useState<{
    avatarUrl?: string;
    name?: string;
    email?: string;
  }>({
    avatarUrl: "",
    name: "",
    email: "",
  });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfile({
          avatarUrl: user.photoURL || "",
          name: user.displayName || "Anonymous",
          email: user.email || "No email",
        });
      } else {
        setProfile({
          avatarUrl: "",
          name: "",
          email: "",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Clear the authentication token cookie by setting its expiration date to the past
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Sign out from Firebase
    await signOut(auth);

    // Redirect to the login page or home page
    window.location.href = "/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar className="relative h-9 w-9 rounded-full">
            <AvatarImage
              src={profile.avatarUrl || ""}
              alt={`${profile.name} avatar image`}
              className="object-cover"
            />
            <AvatarFallback>
              <CircleUser className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.name || "Anonymous"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ProgressBarLink href="/settings">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </ProgressBarLink>
          <ProgressBarLink href="/settings/account">
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
          </ProgressBarLink>
          <ProgressBarLink href="/settings/account">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </ProgressBarLink>
          {/* <InstallPWA open={open} onOpenChange={setOpen}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpen((prev) => !prev);
              }}
            >
              Install Web App
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </InstallPWA> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
