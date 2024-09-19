"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ProgressBarLink } from "./progress-bar";
import { Icons } from "@/components/icons";
import { Input } from "./ui/input";

interface CategoryListProps {
  categoryName: string;
  items: CategoryItem[];
  userProfiles: { [userId: string]: UserProfile };
}
interface CategoryItem {
  id: string;
  title: string;
  brand?: string;
  description?: string;
  images: string[];
  condition?: string;
  userId: string;
  datetime: Timestamp;
}

interface UserProfile {
  displayName: string;
  photoUrl: string;
}

// The CategoryList component
export function CategoryList({
  categoryName,
  items,
  userProfiles,
}: CategoryListProps) {
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state
  const [filteredItems, setFilteredItems] = useState<CategoryItem[]>(items); // Filtered items

  // Update filtered items whenever search query or items change
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.description?.toLowerCase().includes(lowercasedQuery) ||
          ""
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search items..."
        className="w-full p-2 border border-gray-300 rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <h2 className="text-2xl font-bold capitalize">{categoryName}</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => {
          const userProfile = userProfiles[item.userId] || {
            displayName: "Unknown User",
            photoUrl: "",
          };

          const itemDate = new Date(item.datetime.seconds * 1000);

          return (
            <ProgressBarLink href={`/${categoryName}/${item.id}`} key={item.id}>
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
