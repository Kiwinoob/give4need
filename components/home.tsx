"use client"; // Mark this component as a client-side component
import { useRouter } from "next/navigation";
import { db } from "@/app/firebase";
import { Card, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  collection,
  getDocs,
  DocumentData,
  getDoc,
  doc,
} from "firebase/firestore";
import { CircleUser } from "lucide-react";

interface Item {
  title: string;
  condition: string;
  images: string[];
  datetime: string;
  userId: string;
}

interface UserProfile {
  displayName: string;
  photoURL: string;
}

export function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemList: Item[] = [];
        const userIdSet = new Set<string>();

        querySnapshot.forEach((doc: DocumentData) => {
          const item = doc.data() as Item;
          itemList.push(item);
          userIdSet.add(item.userId);
        });

        setItems(itemList);

        // Fetch user profiles
        const userProfiles: Record<string, UserProfile> = {};
        await Promise.all(
          Array.from(userIdSet).map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              userProfiles[userId] = userDoc.data() as UserProfile;
            } else {
              userProfiles[userId] = {
                displayName: "Unknown User",
                photoURL: "",
              };
            }
          })
        );

        setUserProfiles(userProfiles);
      } catch (error) {
        console.error("Error fetching items or user profiles:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-4 p-8 pt-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => router.push("/create-listing")}>
          Create Listing
        </Button>
      </div>
      <div className="flex w-full items-center space-y-2">
        <h2 className="text-2xl font-bold">New Products</h2>
      </div>
      <div className="flex items-center">
        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <Card
              key={index}
              className="w-full max-w-xs rounded-xl border width hover:shadow-lg transition-shadow"
            >
              <div className="grid gap-4 p-4">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl">
                  <img
                    src={item.images[0]}
                    alt="Product image"
                    width="250"
                    height="250"
                    className="aspect-[4/5] object-cover border w-full"
                  />
                </div>
                <div className="grid gap-1.5">
                  <h3 className="font-semibold text-sm md:text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.condition}
                  </p>
                </div>
              </div>
              <CardFooter className="flex items-start space-x-4 justify-start">
                <Avatar>
                  <AvatarImage
                    src={userProfiles[item.userId]?.photoURL || ""}
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    <CircleUser className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {userProfiles[item.userId]?.displayName || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.datetime), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
