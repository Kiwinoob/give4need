"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Package, ShoppingCart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const navLinks = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Nearby",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Listing",
    href: "/products",
    icon: Package,
  },
  {
    title: "Inbox",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: LineChart,
  },
];

export function SideBar() {
  // Use usePathname to get the current path
  const pathname = usePathname();
  return (
    <>
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">Give4Need</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      pathname === link.href
                        ? "bg-muted text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.title}
                    {link.title === "Orders" && (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        6
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
