"use client";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ProgressBarLink } from "./progress-bar";
import { CircleUser } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold capitalize">{categoryName}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
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
                        <CircleUser className="h-5 w-5" />
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
