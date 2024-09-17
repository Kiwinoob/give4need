import { CategoryList } from "@/components/category-list";
import { db } from "@/app/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ProgressBarLink } from "@/components/progress-bar";

// Fetch items in a specific category
async function getCategoryItems(category: string) {
  const itemsRef = collection(db, "items");
  const q = query(itemsRef, where("category", "==", category));
  const querySnapshot = await getDocs(q);

  const items: any[] = [];
  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  return items;
}
interface UserProfile {
  displayName: string;
  photoUrl: string;
}
async function getUserProfiles(): Promise<{ [userId: string]: UserProfile }> {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);

  const profiles: { [userId: string]: UserProfile } = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    profiles[doc.id] = {
      displayName: data.displayName,
      photoUrl: data.photoUrl,
    };
  });

  return profiles;
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const items = await getCategoryItems(params.category);
  const userProfiles = await getUserProfiles();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl capitalize">
            {params.category}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Currently the category you&apos;re looking does not have any items.
            Please check out other categories.
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

  return (
    <div className="space-y-4 p-8 pt-4">
      <CategoryList
        categoryName={params.category}
        items={items}
        userProfiles={userProfiles}
      />
    </div>
  );
}
