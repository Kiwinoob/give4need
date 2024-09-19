"use client";

import Compressor from "compressorjs";
import { useForm } from "react-hook-form";
import { auth, storage, db } from "@/app/firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function ProfileForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const refImageInput = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<{
    avatarUrl?: string;
    name?: string;
  }>({
    avatarUrl: "",
    name: "",
  });
  const [loading, setLoading] = useState(true); // Add loading state

  const form = useForm({
    defaultValues: {
      avatar: "",
      name: "",
    },
  });

  const { setValue } = form;

  // Get current user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfile({
          avatarUrl: user.photoURL || "",
          name: user.displayName || "Anonymous",
        });
        setValue("name", user.displayName || "Anonymous"); // Update form value
        setValue("avatar", user.photoURL || ""); // Update form avatar
        setImagePreview(user.photoURL || ""); // Display existing profile image
      } else {
        // Handle when user is null (logged out)
        setProfile({
          avatarUrl: "",
          name: "",
        });
      }
      setLoading(false); // Set loading to false once the user is loaded
    });
  }, [setValue]);

  const onSubmit = async (data: any) => {
    const user = auth.currentUser;

    if (!user) return;

    const hasNameChanged = data.name !== user.displayName;
    const hasAvatarChanged = data.avatar && imagePreview !== user.photoURL;

    // Update profile picture in Firebase Storage only if the avatar has changed
    if (hasAvatarChanged) {
      const avatarFile = data.avatar;
      const storageRef = ref(storage, `avatars/${user.uid}.`);

      await uploadBytes(storageRef, avatarFile);
      const avatarUrl = await getDownloadURL(storageRef);

      // Update Firebase Authentication profile with the new avatar URL and name if needed
      await updateProfile(user, {
        photoURL: avatarUrl,
        displayName: hasNameChanged ? data.name : user.displayName,
      });

      setProfile({
        avatarUrl,
        name: data.name,
      });

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName: data.name,
        photoUrl: avatarUrl,
      });

      toast.success("Profile updated.", {
        description: "You can now close this page.",
      });
    } else if (hasNameChanged) {
      // Update only the name if it has changed and no avatar is uploaded
      await updateProfile(user, {
        displayName: data.name,
      });

      setProfile((prev) => ({ ...prev, name: data.name }));

      // Update Firestore with the new name
      await setDoc(doc(db, "users", user.uid), {
        displayName: data.name,
        photoUrl: user.photoURL,
      });

      toast.success("Profile Name updated.", {
        description: "You can now close this page.",
      });
    } else {
      toast.success("No changes to update.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 md:col-span-1">
            <Card>
              <CardContent>
                <div className="flex flex-col items-center space-y-6 pb-10 pt-20">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field: { ref, name, onBlur, onChange } }) => (
                      <FormItem>
                        <div
                          className="m-auto mb-5 h-36 w-36 cursor-pointer rounded-full border border-dashed p-2"
                          onClick={() => {
                            refImageInput.current?.click();
                          }}
                        >
                          <FormControl>
                            <Input
                              type="file"
                              accept=".jpg, .jpeg, .png"
                              className="hidden"
                              onChange={(event) => {
                                const file =
                                  event.target.files && event.target.files[0];

                                if (!file) return;

                                new Compressor(file, {
                                  checkOrientation: false,
                                  width: 512,
                                  height: 512,
                                  resize: "cover",
                                  quality: 0.8,
                                  success: (result) => {
                                    onChange(result);
                                    setImagePreview(
                                      URL.createObjectURL(result)
                                    );
                                  },
                                  error: (error) => {
                                    console.error(error.message);
                                  },
                                });
                              }}
                              name={name}
                              ref={(e) => {
                                ref(e);
                                refImageInput.current = e;
                              }}
                              onBlur={onBlur}
                            />
                          </FormControl>

                          {imagePreview ? (
                            <Avatar className="h-32 w-32">
                              <AvatarImage
                                src={imagePreview}
                                alt="preview"
                                className="object-cover"
                              />
                              <AvatarFallback>
                                <Icons.circleUser className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-32 w-32 rounded-full bg-gray-200">
                              <div className="absolute flex h-32 w-32 flex-col items-center justify-center rounded-full text-white opacity-0 duration-300 hover:opacity-70">
                                <Icons.camera size={30} />
                                <div className="text-sm">Update photo</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          Allowed *.jpeg, *.jpg, *.png max size of 5MB
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-3 space-y-8 md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Update profile</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
