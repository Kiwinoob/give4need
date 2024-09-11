"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

export default function CreateListingForm() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null
  ); // State to store latitude and longitude
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser; // Get the current user

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

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
    if (
      !user ||
      !listingTitle ||
      !selectedCondition ||
      images.length === 0 ||
      !latLng
    ) {
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
        latitude: latLng.lat,
        longitude: latLng.lng,
        available: true, // Mark listing as available
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
      toast.success("Successfully created listing.", {
        description: "Your listing is created",
      });
      router.push("/"); // Redirect back to the homepage or product list
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setMeetupLocation(place.formatted_address || "");
      setLatLng({
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
      });
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
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
                    <Image
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
            <CardTitle>List your item</CardTitle>
            <CardDescription>
              Provide details about your item for others to see.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Listing Title */}
              <div className="grid grid-cols-1 gap-1.5">
                <Label htmlFor="listingTitle">Title</Label>
                <Input
                  id="listingTitle"
                  placeholder="Enter item title"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                />
              </div>

              {/* Brand */}
              <div className="grid grid-cols-1 gap-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="Enter item brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Phone Accesssories">
                      Phone Accesssories
                    </SelectItem>
                    <SelectItem value="Tablet & Computer Accesssories">
                      Tablet & Computer Accesssories
                    </SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
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
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Meetup Location */}
              <div className="grid grid-cols-1 gap-1.5">
                <Label htmlFor="meetupLocation">Meetup Location</Label>
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <Input
                    id="meetupLocation"
                    placeholder="Enter meetup location"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                  />
                </Autocomplete>
              </div>

              {/* Create Listing Button */}
              <div className="grid grid-cols-1 gap-1.5">
                <Button onClick={handleCreateListing}>Create Listing</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
