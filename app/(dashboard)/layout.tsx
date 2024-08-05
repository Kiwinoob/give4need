import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SideBar } from "@/components/side-bar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const cookieStore = cookies();
  //const supabase = createClient(cookieStore);

  ////const {
  //data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) redirect("/login");

  //const data = await getUserProfileData(supabase, session.user);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideBar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
