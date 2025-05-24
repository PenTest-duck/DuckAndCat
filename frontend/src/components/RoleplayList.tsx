"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { RoleplayCard } from "./RoleplayCard";
import { CreateRoleplayDialog } from "./CreateRoleplayDialog";
import { toast } from "sonner";

interface Roleplay {
  id: string;
  name: string;
  scenario: string;
  code: string | null;
  created_at: string;
}

export function RoleplayList() {
  const [roleplays, setRoleplays] = useState<Roleplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoleplays = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("roleplays")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRoleplays(data || []);
    } catch (error) {
      toast.error("Failed to fetch roleplays");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleplays();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Roleplays</h2>
        <CreateRoleplayDialog onSuccess={fetchRoleplays} />
      </div>
      
      {roleplays.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No roleplays yet. Create your first one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roleplays.map((roleplay) => (
            <RoleplayCard key={roleplay.id} roleplay={roleplay} />
          ))}
        </div>
      )}
    </div>
  );
} 