"use client"; // Mark this component as a client-side component
import Image from "next/image";
import { useRouter } from "next/navigation"; // For client-side navigation
import { Button } from "@/components/ui/button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
import { toast } from "sonner";
import { MapPin, Check, CircleUser } from "lucide-react";
import Talk from "talkjs";
import { getAuth } from "firebase/auth";

interface Item {
  id: string;
  title: string;
  category: string;
  brand: string;
  description: string;
  condition: string;
  meetupLocation: string;
  images: string[];
  datetime: string;
  userId: string;
  available: boolean;
}
interface UserProfile {
  displayName: string;
  photoUrl: string;
}

export default function ItemDetails({ item }: { item: Item }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [available, setAvailable] = useState(item.available);
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;
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

    // Check if the current user is the owner of the item
    if (currentUser && currentUser.uid === item.userId) {
      setIsOwner(true);
    }
  }, [item.userId, currentUser]);

  const handleContactDonor = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser; // Get the current user
      // Ensure TalkJS is loaded before initializing
      await Talk.ready;

      const currentUser = new Talk.User({
        id: user?.uid || "Unknown ID",
        name: user?.displayName || "Unknown Donor",
        photoUrl: user?.photoURL || "/public/circle-user.svg",
      });

      const donorUser = new Talk.User({
        id: item.userId,
        name: userProfile?.displayName || "Unknown Donor",
        photoUrl: userProfile?.photoUrl || "/public/circle-user.svg",
      });

      const session = new Talk.Session({
        appId: "tbVyGhle",
        me: currentUser,
      });

      const conversation = session.getOrCreateConversation(
        Talk.oneOnOneId(currentUser, donorUser)
      );
      conversation.setParticipant(currentUser);
      conversation.setParticipant(donorUser);
      // Prepare item details to be sent as the first message
      const itemTitle = `Item: ${item.title}`;

      const conversationId = Talk.oneOnOneId(currentUser, donorUser);

      // Navigate to the chat page with the conversation ID
      router.push(
        `/inbox/chat/${conversationId}?itemDetails=${encodeURIComponent(
          itemTitle
        )}`
      );
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Format the meetup location for Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    item.meetupLocation
  )}`;

  // Function to mark the listing as completed
  const toggleAvailability = async () => {
    try {
      const itemDocRef = doc(db, "items", item.id); // Reference to the item document

      // Toggle the availability in Firestore
      await updateDoc(itemDocRef, {
        available: !available, // Toggle the availability based on the local state
      });

      // Update the local state to reflect the change
      setAvailable(!available);

      // Show toast notification
      toast.success(
        available ? "Marked as Completed" : "Marked as Uncompleted",
        {
          description: item.title + " has been updated.",
        }
      );

      // Refresh the page or re-fetch the data
      router.refresh();
    } catch (error) {
      console.error("Error updating item availability:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-center">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            {item.images.map((image, index) => (
              <CarouselItem key={index}>
                <Image
                  src={image}
                  alt={item.title}
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
          <h2 className=" text-2xl font-bold sm:text-4xl lg:text-5xl font-bold">
            {item.title}
          </h2>
          <p className="text">{item.category}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.datetime), {
              addSuffix: true,
            })}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl lg:text-1xl">Brand</h2>
          <p className="text-base">{item.brand}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl lg:text-1xl">
            Description
          </h2>
          <p className="text-base">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          <span className="text-base">{item.condition}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-base">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base underline text-blue-500"
            >
              {item.meetupLocation}
            </a>
          </span>
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
        {!isOwner && (
          <div className="flex gap-4">
            <Button size="lg" onClick={handleContactDonor}>
              Contact Donor
            </Button>
          </div>
        )}
        {isOwner && (
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => router.push(`/edit-listing/${item.id}`)}
            >
              Edit
            </Button>
            {/* Add a button to mark the item as completed */}
            <Button
              size="lg"
              variant={available ? "default" : "secondary"}
              onClick={toggleAvailability}
            >
              {available ? "Mark as Completed" : "Mark as Uncompleted"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
