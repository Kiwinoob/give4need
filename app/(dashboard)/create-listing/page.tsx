import type { Metadata } from "next";
import CreateListingForm from "@/components/create-listing-form";
export const metadata: Metadata = {
  title: "Creating lisiting",
  description: "Creating lisiting for items",
};
export default function CreateListing() {
  return (
    <div className="space-p-8">
      <h2 className="text-2xl font-bold">Create New Item Listing</h2>
      <CreateListingForm />
    </div>
  );
}
