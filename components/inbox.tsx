"use client"; // Mark this component as a client-side component
import { useEffect, useRef } from "react";
import Talk from "talkjs";
import { getAuth } from "firebase/auth";

export default function InboxComponent() {
  const inboxContainer = useRef<HTMLDivElement | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const initializeInbox = async () => {
      await Talk.ready;

      // Current user (the one viewing the inbox)
      const currentUser = new Talk.User({
        id: user?.uid || "Unknown ID",
        name: user?.displayName || "Unknown User",
        photoUrl: user?.photoURL || "/public/circle-user.svg",
      });

      // TalkJS session initialization
      const session = new Talk.Session({
        appId: "tbVyGhle",
        me: currentUser,
      });

      // Inbox instantiation
      const inbox = session.createInbox();

      // Render the inbox in the container
      if (inboxContainer.current) {
        inbox.mount(inboxContainer.current);
      }

      // Clean up the inbox when the component unmounts
      return () => inbox.destroy();
    };

    if (user) {
      initializeInbox();
    }
  }, [user]);

  return (
    <div
      className="inbox-container h-[500px] w-full"
      ref={inboxContainer}
    ></div>
  );
}
