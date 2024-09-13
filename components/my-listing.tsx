"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBarLink } from "./progress-bar";

interface Item {
  id: string;
  title: string;
  category: string;
  brand: string;
  description: string;
  condition: string;
  meetupLocation: string;
  images: string[];
  datetime: Timestamp;
  userId: string;
  available: boolean;
}

export default function MyListings() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
  } | null>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
        });

        // Fetch user listings
        try {
          const userListingsQuery = query(
            collection(db, "items"),
            where("userId", "==", currentUser.uid),
            orderBy("datetime", "desc")
          );
          const querySnapshot = await getDocs(userListingsQuery);
          const fetchedItems: Item[] = [];
          querySnapshot.forEach((doc) => {
            const itemData = doc.data() as Omit<Item, "id">;
            fetchedItems.push({
              id: doc.id,
              ...itemData,
            });
          });
          setItems(fetchedItems);
        } catch (error) {
          console.error("Error fetching user listings:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="bg-background text-foreground">
        <div className="bg-primary text-primary-foreground py-6 px-4 md:px-6">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-4">
            <Avatar className="w-16 h-16 md:w-20 md:h-20">
              {user?.photoURL ? (
                <AvatarImage
                  src={user.photoURL}
                  alt={user.displayName || "Unknown User"}
                />
              ) : (
                <AvatarFallback>
                  <CircleUser className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 grid gap-2">
              <h1 className="text-lg md:text-xl font-bold">
                {user?.displayName || "Unknown User"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(`/settings`)}
            >
              Edit Profile
            </Button>
          </div>
        </div>
        <div className="flex justify-end py-4">
          <Button size="sm" onClick={() => router.push("/create-listing")}>
            Create Listing
          </Button>
        </div>
        <div className="container mx-auto py-8 px-4 md:px-6 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg group"
              >
                <Skeleton className="w-full h-64" />
                <div className="p-4">
                  <Skeleton className="text-base md:text-lg font-semibold" />
                  <Skeleton className="text-xs md:text-sm text-muted-foreground" />
                </div>
              </div>
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <ProgressBarLink href={`/item/${item.id}`} key={item.id}>
                <div className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg group">
                  <div className="relative">
                    <Image
                      src={item.images[0] || ""}
                      alt={item.title}
                      width={500}
                      height={400}
                      className="w-full h-64 object-cover"
                      style={{ aspectRatio: "500/400", objectFit: "cover" }}
                    />
                    {!item.available && (
                      <div className="absolute bottom-0 left-0 bg-black text-white p-2 text-center w-full">
                        Completed
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base md:text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {item.condition}
                    </p>
                  </div>
                </div>
              </ProgressBarLink>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-40">
              <p className="text-center">
                Your listings will appear here, currently you have no listing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
