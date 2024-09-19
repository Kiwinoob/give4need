import type { Metadata } from "next";
import LatestItems from "@/components/latest-items";
export const metadata: Metadata = {
  title: "Latest Items",
  description: "Displaying the latest item",
};

export default async function LastestItemPage() {
  return (
    <div className="space-y-4 p-8 pt-4">
      <LatestItems />
    </div>
  );
}
