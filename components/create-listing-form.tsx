"use client"; // Mark this component as a client-side component
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { XIcon, ImageIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/app/firebase"; // Import your Firebase setup
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export default function CreateListingForm() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [meetupLocation, setMeetupLocation] = useState(""); // Add meetup location state
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser; // Get the current user

  const conditions = [
    { label: "New", description: "Brand new, never used" },
    { label: "Like New", description: "Used but in excellent condition" },
    { label: "Good", description: "Used but in good condition" },
    { label: "Fair", description: "Used and shows signs of wear" },
    { label: "Poor", description: "Used and in poor condition" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files); // Convert the FileList to an array
      setImages((prevImages) => [...prevImages, ...newImages].slice(0, 3)); // Add new images and limit to 3
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition);
  };

  const handleCreateListing = async () => {
    if (!user || !listingTitle || !selectedCondition || images.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Step 1: Create a Firestore document to get the listing UID
      const docRef = await addDoc(collection(db, "items"), {
        title: listingTitle,
        condition: selectedCondition,
        category: selectedCategory,
        brand,
        description,
        meetupLocation, // Include meetup location in the document
        images: [], // Placeholder for images, we'll update this later
        datetime: new Date().toISOString(), // Include the actual creation time
        userId: user.uid, // Save the current user ID
      });

      const uid = docRef.id; // Get the UID of the newly created document

      // Step 2: Upload images to Firebase Storage using the listing UID
      const imageUrls = [];
      for (const image of images) {
        try {
          const imageRef = ref(storage, `items/${uid}/${image.name}`);
          const snapshot = await uploadBytes(imageRef, image);
          const url = await getDownloadURL(snapshot.ref);
          imageUrls.push(url);
        } catch (error) {
          console.error("Error uploading image:", error);
          // Handle the error (e.g., show a user-friendly message)
        }
      }

      // Step 3: Update the Firestore document with the image URLs
      const itemDocRef = doc(db, "items", uid); // Reference to the existing document
      await updateDoc(itemDocRef, {
        images: imageUrls, // Update the document with the URLs of the uploaded images
      });
      toast.success("Successfully create listing.", {
        description: "Your is lisiting is created",
      });
      router.push("/"); // Redirect back to the homepage or product list
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto py-6 sm:py-8 md:py-10">
      {/* Image Upload Section */}
      <div className="col-span-1 md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Drag and drop or click to upload up to 3 images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Clickable Drag-and-Drop Area */}
              <label className="group relative flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted transition-colors hover:border-primary">
                <div className="z-10 flex flex-col items-center justify-center space-y-2 text-muted-foreground group-hover:text-primary">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop or click to upload
                  </p>

                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </label>

              {/* Uploaded images */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative rounded-lg border">
                    <img
                      src={URL.createObjectURL(image)}
                      width={250}
                      height={250}
                      alt={`Uploaded Image ${index + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 rounded-full bg-background p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <XIcon className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Details Section */}
      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="listing-title">Listing Title</Label>
                <Input
                  id="listing-title"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  placeholder="Enter listing title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Enter brand"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <div className="flex gap-2">
                  {conditions.map((condition) => (
                    <Button
                      key={condition.label}
                      variant={
                        selectedCondition === condition.label
                          ? "default" // Use "default" instead of "primary"
                          : "outline"
                      }
                      onClick={() => handleConditionSelect(condition.label)}
                    >
                      {condition.label}
                    </Button>
                  ))}
                </div>
                {selectedCondition && (
                  <div className="text-muted-foreground text-sm">
                    {
                      conditions.find((c) => c.label === selectedCondition)
                        ?.description
                    }
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="meetup-location">Meetup Location</Label>
                  <Input
                    id="meetup-location"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    placeholder="Enter meetup location"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Button for Creating Listing */}
      <div className="col-span-1 md:col-span-3 flex justify-end mt-4">
        <Button onClick={handleCreateListing} className="w-auto">
          Create Listing
        </Button>
      </div>
    </div>
  );
}
