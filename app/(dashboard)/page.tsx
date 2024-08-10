import type { Metadata } from "next";
import { Home } from "@/components/home";
export const metadata: Metadata = {
  title: "Home",
  description: "Home",
};

export default async function Index() {
  return (
    <main className="space-y-4 p-8 pt-4">
      <Home />
    </main>
  );
}
