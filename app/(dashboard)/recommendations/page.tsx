import type { Metadata } from "next";
import Recommendation from "@/components/recommendation";
export const metadata: Metadata = {
  title: "Recommendations",
  description: "Recommendations item for you",
};

export default async function RecommendationsPage() {
  return (
    <div className="space-y-4 p-8 pt-4">
      <Recommendation />
    </div>
  );
}
