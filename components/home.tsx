"use client"; // Mark this component as a client-side component
import Image from "next/image";
import { db } from "@/app/firebase";
import { auth } from "@/app/firebase"; // Import Firebase Auth to get current user
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  collection,
  getDocs,
  DocumentData,
  getDoc,
  doc,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { Icons } from "@/components/icons";
import { ProgressBarLink } from "./progress-bar";

interface Item {
  id: string;
  title: string;
  condition: string;
  images: string[];
  category: string;
  datetime: Timestamp;
  userId: string;
  available: boolean;
}

interface UserProfile {
  displayName: string;
  photoUrl: string;
}

export function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Track current user ID

  useEffect(() => {
    // Fetch the current user ID
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid); // Store current user ID
      }
    });

    return () => unsubscribe(); // Cleanup the subscription on unmount
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "items"), orderBy("datetime", "desc"), limit(4))
        );
        const itemList: Item[] = [];
        const userIdSet = new Set<string>();

        querySnapshot.forEach((doc: DocumentData) => {
          const item = doc.data() as Item;

          // Exclude items created by the current user
          if (item.userId !== currentUserId && item.available !== false) {
            itemList.push({ ...item, id: doc.id });
            userIdSet.add(item.userId); // Collect user IDs for profile fetching
          }
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
                photoUrl: "",
              };
            }
          })
        );

        setUserProfiles(userProfiles);
      } catch (error) {
        console.error("Error fetching items or user profiles:", error);
      }
    };

    if (currentUserId) {
      fetchItems();
    }
  }, [currentUserId]);

  return (
    <div>
      <div className="py-6 md:py-12 lg:py-16">
        <div className="container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <ProgressBarLink
            href="/electronics"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.laptop className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Electronics</span>
          </ProgressBarLink>
          <ProgressBarLink
            href="/accessories"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.accessories className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Accessories</span>
          </ProgressBarLink>
          <ProgressBarLink
            href="/books"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.books className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Books</span>
          </ProgressBarLink>
          <ProgressBarLink
            href="/clothing"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.clothing className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Clothing</span>
          </ProgressBarLink>
          <ProgressBarLink
            href="/household"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.household className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Household</span>
          </ProgressBarLink>
          <ProgressBarLink
            href="/toys"
            className="group flex flex-col items-center gap-2 hover:text-primary"
            prefetch={false}
          >
            <div className="bg-muted p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icons.toys className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Toys</span>
          </ProgressBarLink>
        </div>
      </div>
      <div className="py-6 md:py-12 lg:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Items</h2>
            <ProgressBarLink
              href="/latest-items"
              className="text-primary hover:underline"
              prefetch={false}
            >
              View All
            </ProgressBarLink>
          </div>
          <div className="flex items-center">
            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <ProgressBarLink
                  href={`/${item.category}/${item.id}`}
                  key={item.id}
                >
                  <div className="bg-background rounded-lg shadow-lg overflow-hidden">
                    <div className="relative">
                      <Image
                        src={item.images[0]}
                        alt="Product image"
                        width="250"
                        height="250"
                        className="aspect-[4/5] object-cover border w-full"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-lg font-bold"> {item.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {item.condition}
                      </p>

                      <div className="flex items-start space-x-4 justify-start">
                        <Avatar>
                          <AvatarImage
                            src={userProfiles[item.userId]?.photoUrl}
                            alt="User avatar"
                          />
                          <AvatarFallback>
                            <Icons.circleUser className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {userProfiles[item.userId]?.displayName ||
                              "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.datetime
                              ? formatDistanceToNow(
                                  item.datetime instanceof Timestamp
                                    ? item.datetime.toDate() // Convert Firestore Timestamp to JS Date
                                    : new Date(item.datetime), // Handle non-Timestamp formats if any
                                  { addSuffix: true }
                                )
                              : "unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ProgressBarLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
