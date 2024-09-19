"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
//import { Badge } from "@/components/ui/badge";
import { ProgressBarLink } from "@/components/progress-bar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";

export const navLinks = [
  {
    title: "Home",
    href: "/",
    icon: Icons.home,
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Icons.heartHandshake,
  },
  {
    title: "Listing",
    href: "/listing",
    icon: Icons.listing,
  },
  {
    title: "Inbox",
    href: "/inbox",
    icon: Icons.mail,
  },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Icons.menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <ProgressBarLink
              href="/"
              className="flex items-center gap-2 font-semibold"
            >
              <Icons.listing className="h-6 w-6" />
              <span className="">Give4Need</span>
            </ProgressBarLink>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <ProgressBarLink
                  key={link.href}
                  href={link.href}
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                    pathname === link.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.title}
                </ProgressBarLink>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex flex-grow basis-0 justify-end space-x-2 align-middle">
        <UserNav />
      </div>
    </header>
  );
}
