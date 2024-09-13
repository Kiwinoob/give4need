import type { Metadata } from "next";
import Listing from "@/components/my-listing";
export const metadata: Metadata = {
  title: "Lisiting",
  description: "My Lisiting",
};

export default async function ListingPage() {
  return (
    <div className="space-y-4 p-8 pt-4">
      <Listing />
    </div>
  );
}
