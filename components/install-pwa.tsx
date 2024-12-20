"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconDotsVertical,
  IconShare2,
  IconSquarePlus,
} from "@tabler/icons-react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOs } from "@/hooks/use-os";
import { name } from "@/lib/config";

export function InstallPWA({
  children,
  open,
  onOpenChange: setOpen,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const os = useOs();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex w-full items-center justify-center gap-1 text-3xl font-medium">
              <Icons.logo className="h-12 w-12" />
              {name || "DEFAULT TITLE"}
            </div>
          </DialogTitle>
          <DialogDescription>
            To enable notifications, you need to install the app and enable push
            notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <h5 className="text-md font-semibold tracking-tight">
            Follow these steps to install the app:
          </h5>
          <ul className="mb-4 ml-6 list-decimal [&>li]:mt-2">
            <li>
              Tap on
              <Button
                variant="outline"
                size="icon"
                className="mx-2 h-8 w-8 bg-muted align-middle hover:bg-muted"
              >
                {os === "ios" ? (
                  <IconShare2 className="h-6 w-6 text-blue-400" />
                ) : (
                  <IconDotsVertical size="1rem" />
                )}
              </Button>
              {os === "ios" ? "in Safari tab bar" : "in Chrome nav bar"}
            </li>
            <li>
              Scroll and select{" "}
              <code className="relative rounded border border-input bg-muted px-[0.4rem] py-[0.3rem] text-sm font-bold">
                Add to Home Screen{" "}
                <IconSquarePlus className="inline h-4 w-4 align-middle" />
              </code>
            </li>
            <li>
              Look for the
              <Button
                variant="outline"
                size="icon"
                className="mx-2 h-8 w-8 bg-muted align-middle hover:bg-muted"
              >
                <Icons.logo className="h-12 w-12" />
              </Button>
              icon on your home screen
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
