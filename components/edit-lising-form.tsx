"use client";
import { useState, useEffect } from "react";
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
import { db, storage } from "@/app/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
//import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

interface EditListingFormProps {
  id: string;
}

export default function EditListingForm({ id }: EditListingFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]); // State to track images marked for removal
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [item, setItem] = useState<any>(null);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  //   libraries,
  // });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem(data);
          setListingTitle(data.title);
          setSelectedCategory(data.category);
          setSelectedCondition(data.condition);
          setBrand(data.brand);
          setDescription(data.description);
          setMeetupLocation(data.meetupLocation);

          // Handle current images
          if (data.images) {
            setCurrentImages(data.images);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    fetchItem();
  }, [id]);

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

  const handleRemoveCurrentImage = (indexToRemove: number) => {
    const imageToRemove = currentImages[indexToRemove];
    setImagesToRemove((prevImages) => [...prevImages, imageToRemove]);
    setCurrentImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition);
  };

  const handleUpdateListing = async () => {
    if (!user || !listingTitle || !selectedCondition) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Step 1: Update Firestore document with new details
      const docRef = doc(db, "items", id);
      const updatedData = {
        title: listingTitle,
        condition: selectedCondition,
        category: selectedCategory,
        brand,
        description,
        meetupLocation, // Include meetup location in the document
      };

      // Update the document with new details
      await updateDoc(docRef, updatedData);

      // Step 2: Remove images marked for deletion from Firebase Storage
      if (imagesToRemove.length > 0) {
        for (const imageUrl of imagesToRemove) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }

        // Update Firestore to remove the deleted images
        await updateDoc(docRef, {
          images: currentImages.filter((url) => !imagesToRemove.includes(url)),
        });
      }

      // Step 3: Upload new images to Firebase Storage and update URLs
      if (images.length > 0) {
        const imageUrls = [];
        for (const image of images) {
          try {
            const imageRef = ref(storage, `items/${id}/${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            const url = await getDownloadURL(snapshot.ref);
            imageUrls.push(url);
          } catch (error) {
            console.error("Error uploading image:", error);
            // Handle the error (e.g., show a user-friendly message)
          }
        }

        // Combine new image URLs with existing ones
        const allImages = [...currentImages, ...imageUrls];

        // Update the document with the URLs of the uploaded images
        await updateDoc(docRef, {
          images: allImages,
        });
      }

      toast.success("Successfully updated listing.", {
        description: "Your listing has been updated",
      });
      router.push("/"); // Redirect back to the homepage or product list
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const handleDeleteListing = async () => {
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    try {
      // Step 1: Delete all images from Firebase Storage
      for (const imageUrl of currentImages) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      // Step 2: Delete the Firestore document
      const docRef = doc(db, "items", id);
      await deleteDoc(docRef);

      toast.success("Listing deleted successfully.", {
        description: "The " + item.title + " has been removed.",
      });
      router.push("/"); // Redirect to the homepage or product list
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Error deleting listing.", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  // if (!isLoaded) {
  //   return <p>Loading...</p>;
  // }

  // const handlePlaceChanged = () => {
  //   if (autocomplete !== null) {
  //     const place = autocomplete.getPlace();
  //     setMeetupLocation(place.formatted_address || "");
  //   } else {
  //     console.log("Autocomplete is not loaded yet!");
  //   }
  // };

  // const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
  //   setAutocomplete(autocompleteInstance);
  // };

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
            <div className="space-y-4">
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
                {currentImages.map((url, index) => (
                  <div key={index} className="relative rounded-lg border">
                    <Image
                      src={url}
                      width={250}
                      height={250}
                      alt={`Current image ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                      onClick={() => handleRemoveCurrentImage(index)}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {images.map((image, index) => (
                  <div key={index} className="relative rounded-lg border">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded image ${index + 1}`}
                      width={250}
                      height={250}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Fields */}
      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={selectedCondition}
                  onValueChange={handleConditionSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.label} value={condition.label}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Meetup Location */}
              <div className="space-y-2">
                <Label htmlFor="meetupLocation">Meetup Location</Label>
                {/* <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <Input
                    id="meetupLocation"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                  />
                </Autocomplete> */}
                <Input
                  id="meetupLocation"
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                  placeholder="Enter meetup location"
                />
              </div>
            </div>
          </CardContent>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={handleUpdateListing}>Update</Button>
              <Button variant="destructive" onClick={handleDeleteListing}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
