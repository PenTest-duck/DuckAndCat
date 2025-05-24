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
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useTeacher } from "@/contexts/TeacherContext";
import { Language } from "@/utils/types";

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const { language, setLanguage, isLoading } = useTeacher();

  useEffect(() => {
    console.log("Language in sidebar:", language);
  }, [language]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("languages")
          .select("*");

        if (error) throw error;
        if (data) {
          setLanguages(data);
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        toast.error("Failed to load languages");
      }
    };

    fetchLanguages();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLanguageChange = async (newLanguageId: string) => {
    try {
      const selectedLanguage = languages.find(lang => lang.id === newLanguageId);
      if (!selectedLanguage) {
        throw new Error("Selected language not found");
      }
      await setLanguage(selectedLanguage);
      toast.success("Language updated successfully!");
    } catch (error) {
      toast.error("Failed to update language");
      console.error(error);
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
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Image
                src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="flex-1 text-left truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={language?.id || ""}
                onValueChange={handleLanguageChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 