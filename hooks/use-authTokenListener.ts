import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/app/firebase";

const useAuthTokenListener = () => {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        document.cookie = `auth-token=${idToken}; expires=${new Date(
          Date.now() + 86400 * 30 // Update cookie for 30 days
        ).toUTCString()}; path=/; ${
          process.env.NODE_ENV === "production" ? "Secure; " : ""
        }SameSite=Lax`;
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);
};

export default useAuthTokenListener;
