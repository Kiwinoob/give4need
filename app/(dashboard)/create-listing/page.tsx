import type { Metadata } from "next";
import CreateListingForm from "@/components/create-listing-form";
export const metadata: Metadata = {
  title: "Creating lisiting",
  description: "Creating lisiting for items",
};
export default function CreateListing() {
  return (
    <div className="space-y-4 p-8 pt-4">
      <h2 className="text-2xl font-bold sm:text-4xl lg:text-5xl">
        Create New Item Listing
      </h2>
      <CreateListingForm />
    </div>
  );
}
