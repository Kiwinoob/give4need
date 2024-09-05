"use client"; // Mark this component as a client-side component
import { useEffect, useRef } from "react";
import Talk from "talkjs";
import { getAuth } from "firebase/auth";

export default function Chat({ conversationId }: { conversationId: string }) {
  const chatboxContainer = useRef<HTMLDivElement | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const initializeChat = async () => {
      await Talk.ready;

      // Current user (the one who initiates the chat)
      const currentUser = new Talk.User({
        id: user?.uid || "Unknown ID",
        name: user?.displayName || "Unknown Donor",
        photoUrl: user?.photoURL || "/public/circle-user.svg",
      });

      // TalkJS session initialization
      const session = new Talk.Session({
        appId: "tbVyGhle",
        me: currentUser,
      });

      // Get or create the conversation
      const conversation = session.getOrCreateConversation(conversationId);

      // Read item details from query parameters
      const itemTitle = new URLSearchParams(window.location.search).get(
        "itemTitle"
      );

      // Send item details as the first message if available
      if (itemTitle) {
        conversation.sendMessage(
          `Hi, I'm interested in your item: ${decodeURIComponent(itemTitle)}`
        );
      }
      // Set participants in the conversation (you can add more participants)
      conversation.setParticipant(currentUser);

      // Chatbox instantiation
      const chatbox = session.createChatbox(conversation);

      // Render the chatbox in the container
      if (chatboxContainer.current) {
        chatbox.mount(chatboxContainer.current);
      }

      // Clean up the chatbox when the component unmounts
      return () => chatbox.destroy();
    };

    if (user) {
      initializeChat();
    }
  }, [conversationId, user]);

  return (
    <div
      className="chatbox-container h-[500px] w-full"
      ref={chatboxContainer}
    ></div>
  );
}
