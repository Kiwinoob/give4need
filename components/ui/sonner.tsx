"use client";

import { Toaster as Sonner } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sonner
      position={isDesktop ? "bottom-right" : "top-center"}
      className="toaster group pointer-events-auto"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-muted group-[.toaster]:border-border translate-x-[35%] translate-y-[-35%] left-[unset] right-0 top-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
