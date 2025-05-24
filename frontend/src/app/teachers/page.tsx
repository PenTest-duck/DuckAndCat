"use client";

import { useEffect, useState } from "react";
import { RoleplayList } from "@/components/RoleplayList";
import { TeacherOnboardingDialog } from "@/components/TeacherOnboardingDialog";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { TeacherProvider } from "@/contexts/TeacherContext";

export default function TeachersPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkTeacherStatus();
  }, []);

  const checkTeacherStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      setUser(user);

      const { data, error } = await supabase
        .from("teachers")
        .select("id")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
        throw error;
      }

      setShowOnboarding(!data);
    } catch (error) {
      console.error("Error checking teacher status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <TeacherProvider user={user}>
      <div className="flex h-screen">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8 px-4">
            <Toaster />
            <TeacherOnboardingDialog 
              open={showOnboarding} 
              onComplete={() => setShowOnboarding(false)} 
            />
            <RoleplayList />
          </div>
        </main>
      </div>
    </TeacherProvider>
  );
} 