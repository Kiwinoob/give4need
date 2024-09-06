import type { Metadata } from "next";
import EditListingForm from "@/components/edit-lising-form";
export const metadata: Metadata = {
  title: "Edit lisiting",
  description: "Editing lisiting for items",
};
export default function EditListing({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4 p-8 pt-4">
      <h2 className="text-2xl font-bold sm:text-4xl lg:text-5xl">
        Edit Listing
      </h2>
      {params.id && typeof params.id === "string" ? (
        <EditListingForm id={params.id} />
      ) : (
        <p>Invalid ID</p>
      )}
    </div>
  );
}
