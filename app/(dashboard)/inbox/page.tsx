import type { Metadata } from "next";
import Inbox from "@/components/inbox";
export const metadata: Metadata = {
  title: "Inbox",
  description: "Chat History",
};

export default async function InboxPage() {
  return (
    <div className="space-y-4 p-8 pt-4">
      <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Inbox</h2>
      <Inbox />
    </div>
  );
}
