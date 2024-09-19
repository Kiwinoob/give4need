"use client";

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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { auth } from "@/app/firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      email: "",
      oldPassword: "",
      newPassword: "",
    },
  });

  const { handleSubmit, control, setValue, reset } = form;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setValue("email", user.email || ""); // Set form default value to current user's email
    }
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const { email, oldPassword, newPassword } = data;

    if (oldPassword === newPassword) {
      toast.error("Old password cannot be the same as the new password.");
      setIsLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("No user is currently logged in.");
      setIsLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, oldPassword);
      await reauthenticateWithCredential(user, credential);

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      toast.success("Account updated successfully");
      reset({ oldPassword: "", newPassword: "" }); // Reset only sensitive fields
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error(
        `Error updating account: Wrong credentials entered, Please check email and old password entered`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="after:text-red-500 after:content-['_*']"
                aria-required
              >
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your email address"
                  {...field}
                  // Ensure onChange updates the form state
                  onChange={(e) => {
                    setValue("email", e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                This is the email address that you use to login.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="after:text-red-500 after:content-['_*']"
                aria-required
              >
                Old password
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="Old password" {...field} />
              </FormControl>
              <FormDescription>
                Required to make changes to your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="New password" {...field} />
              </FormControl>
              <FormDescription>
                Your password must be at least 8 characters or numbers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            Update account
          </Button>
        </div>
      </form>
    </Form>
  );
}
