import ItemDetails from "@/components/item-details";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Metadata } from "next";
import { ProgressBarLink } from "@/components/progress-bar";

export const metadata: Metadata = {
  title: "Item Information",
  description: "Information about the Item",
};

export default async function ItemPage({
  params,
}: {
  params: { categoryName: string; id: string };
}) {
  const itemDocRef = doc(db, "items", params.id);
  const itemSnapshot = await getDoc(itemDocRef);

  if (!itemSnapshot.exists()) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl capitalize">
            Product Not Found
          </h1>
          <p className="mt-4 text-muted-foreground">
            The product you&apos;re looking for could not be found. Please check
            the URL or try searching again.
          </p>
          <div className="mt-6">
            <ProgressBarLink
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              prefetch={false}
            >
              Go to Homepage
            </ProgressBarLink>
          </div>
        </div>
      </div>
    );
  }

  const itemData = itemSnapshot.data();
  const item = {
    id: itemSnapshot.id,
    title: itemData.title,
    category: itemData.category,
    brand: itemData.brand,
    description: itemData.description,
    condition: itemData.condition,
    meetupLocation: itemData.meetupLocation,
    images: itemData.images,
    datetime: itemData.datetime.toDate().toISOString(),
    userId: itemData.userId,
    available: itemData.available,
  };

  return (
    <div className="space-y-4 p-8 pt-4">
      <ItemDetails item={item} />
    </div>
  );
}
