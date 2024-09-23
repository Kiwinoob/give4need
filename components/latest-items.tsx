"use client"; // Mark this component as client-side
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { auth } from "@/app/firebase";
import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import {
  collection,
  getDocs,
  DocumentData,
  getDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { ProgressBarLink } from "@/components/progress-bar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { Input } from "./ui/input";

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

export default function LatestItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Track current user ID
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state
  const [filteredItems, setFilteredItems] = useState<Item[]>([]); // Filtered items

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
          query(collection(db, "items"), orderBy("datetime", "desc"))
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
        setFilteredItems(itemList); // Set filtered items initially

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

  useEffect(() => {
    // Filter items based on search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.condition.toLowerCase().includes(lowercasedQuery) ||
          item.category.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);
  // If there are no items to display
  if (items.length === 0) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl capitalize">
            No item available currently
          </h1>
          <p className="mt-4 text-muted-foreground">
            Currently, there are no items available yet. Please, check after a
            few days later
          </p>
          <div className="mt-6">
            <ProgressBarLink
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              prefetch={false}
            >
              Go to Homepage
            </ProgressBarLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search items..."
        className="w-full p-2 border border-gray-300 rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <h2 className="text-2xl font-bold capitalize">Latest Items</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => {
          const userProfile = userProfiles[item.userId] || {
            displayName: "Unknown User",
            photoUrl: "",
          };

          const itemDate = new Date(item.datetime.seconds * 1000);

          return (
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
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {item.condition}
                  </p>
                  <div className="flex items-start space-x-4 justify-start">
                    <Avatar>
                      <AvatarImage
                        src={userProfile.photoUrl}
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        <Icons.circleUser className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {userProfile.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(itemDate, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ProgressBarLink>
          );
        })}
      </div>
    </div>
  );
}
