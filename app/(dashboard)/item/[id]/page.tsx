import ItemDetails from "@/components/item-details";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item Information",
  description: "Information about the Item",
};

export default async function ItemPage({ params }: { params: { id: string } }) {
  const itemDocRef = doc(db, "items", params.id);
  const itemSnapshot = await getDoc(itemDocRef);

  if (!itemSnapshot.exists()) {
    return <div>Item not found</div>;
  }

  const itemData = itemSnapshot.data();
  const item = {
    id: itemSnapshot.id,
    title: itemData.title,
    category: itemData.category,
    description: itemData.description,
    condition: itemData.condition,
    meetupLocation: itemData.meetupLocation,
    images: itemData.images,
    datetime: itemData.datetime,
    userId: itemData.userId,
  };

  return (
    <div className="space-p-8">
      <ItemDetails item={item} />
    </div>
  );
}