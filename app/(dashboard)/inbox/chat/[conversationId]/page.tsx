import type { Metadata } from "next";
import Chat from "@/components/chat";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with users",
};

export default function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;

  return (
    <div className="space-y-4 p-8 pt-4">
      <h2 className="text-2xl font-bold">Chat</h2>
      <Chat conversationId={conversationId} />
    </div>
  );
}
