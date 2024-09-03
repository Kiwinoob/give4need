"use client"; // Mark this component as a client-side component
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { MapPin, Check, CircleUser } from "lucide-react";

interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  meetupLocation: string;
  images: string[];
  datetime: string;
  userId: string;
}
interface UserProfile {
  displayName: string;
  photoUrl: string;
}

export default function ItemDetails({ item }: { item: Item }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, "users", item.userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          setUserProfile(userProfile);
        } else {
          console.log("No such user document!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [item.userId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-center">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            {item.images.map((image, index) => (
              <CarouselItem key={index}>
                <img
                  src={image}
                  alt="Item Image"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-square relative"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="mr-2" />
          <CarouselNext className="ml-auto mr-2" />
        </Carousel>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
          <p className="text">{item.category}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.datetime), {
              addSuffix: true,
            })}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold">Description</h2>
          <p className="text-base">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          <span className="text-base">Condition - {item.condition}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-base">Location - {item.meetupLocation}</span>
        </div>

        <h2 className="text-xl font-bold">Donor</h2>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={userProfile?.photoUrl} alt="Seller Profile" />
            <AvatarFallback>
              <CircleUser className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-medium">
              {userProfile?.displayName || "Unknown Seller"}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button size="lg">Contact Donor</Button>
        </div>
      </div>
    </div>
  );
}
