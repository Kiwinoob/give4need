import { type Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import ResetForm from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset ",
  description: "Login to your account",
};

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Type in your email and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetForm />
            <div className="mt-4 text-center text-sm">
              <Link
                href="/login"
                className="hover:text-brand underline underline-offset-4"
              >
                Go back to the login page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
