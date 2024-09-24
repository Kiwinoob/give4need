import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { toast } from "sonner"; // or any notification library you use

export function PushNotifications() {
  useEffect(() => {
    const messaging = getMessaging();

    // Request notification permission from the user
    getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY, // Add your Firebase VAPID key
    })
      .then((currentToken) => {
        if (currentToken) {
          console.log("FCM Token:", currentToken);
          // Send this token to your server and store it for later use
        } else {
          console.log("No registration token available.");
        }
      })
      .catch((err) => {
        console.error("Error retrieving FCM token:", err);
      });

    // Listen for incoming messages
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      toast(`New message: ${payload.notification?.title}`, {
        description: payload.notification?.body,
      });
    });
  }, []);

  return null;
}
