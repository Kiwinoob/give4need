"use client"; // Mark this component as a client-side component
import { useEffect, useRef, useState } from "react";
import Talk from "talkjs";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function InboxComponent() {
  const inboxContainer = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{
    uid: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const initializeInbox = async () => {
      await Talk.ready;

      if (user) {
        // Current user (the one viewing the inbox)
        const currentUser = new Talk.User({
          id: user.uid || "Unknown ID",
          name: user.displayName || "Unknown User",
          photoUrl: user.photoURL || "/public/circle-user.svg",
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
      }
    };

    initializeInbox();
  }, [user]);

  return (
    <div
      className="inbox-container h-[500px] w-full mx-auto py-6 sm:py-8 md:py-10"
      ref={inboxContainer}
    ></div>
  );
}
