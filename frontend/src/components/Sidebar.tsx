"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Settings, 
  ChevronDown, 
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from "@/utils/supabase/database.types";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

type Language = Database["public"]["Enums"]["language"];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<Language>("EN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeacherLanguage();
    }
  }, [user]);

  const fetchTeacherLanguage = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("teachers")
        .select("language")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data?.language) {
        setLanguage(data.language);
      }
    } catch (error) {
      console.error("Error fetching teacher language:", error);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("teachers")
        .update({ language: newLanguage })
        .eq("id", user?.id);

      if (error) throw error;

      setLanguage(newLanguage);
      toast.success("Language updated successfully!");
    } catch (error) {
      toast.error("Failed to update language");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-64 bg-gray-50 border-r flex flex-col">
      {/* Navigation */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => router.push("/teachers")}
        >
          <BookOpen className="h-5 w-5" />
          Roleplays
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                  {user?.user_metadata?.avatar_url && (
                    <Image
                      src={user.user_metadata.avatar_url}
                      width={32}
                      height={32}
                      alt={user.user_metadata.full_name || "User"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {user?.user_metadata?.full_name || "User"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={language}
                onValueChange={handleLanguageChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="ZH">Chinese</SelectItem>
                  <SelectItem value="JA">Japanese</SelectItem>
                  <SelectItem value="KO">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 