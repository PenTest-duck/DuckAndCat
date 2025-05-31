import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TeacherProvider } from "@/contexts/TeacherContext";

export default async function VocabularyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <TeacherProvider user={data.user}>
      <div className="flex h-screen">
        <Sidebar user={data.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </TeacherProvider>
  );
} 