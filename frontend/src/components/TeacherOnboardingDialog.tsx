"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Database } from "@/utils/supabase/database.types";

type Language = Database["public"]["Enums"]["language"];

interface TeacherOnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function TeacherOnboardingDialog({ open, onComplete }: TeacherOnboardingDialogProps) {
  const [language, setLanguage] = useState<Language>("EN");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("teachers")
        .insert([
          {
            id: user.id,
            language,
          },
        ]);

      if (error) throw error;

      toast.success("Language preference saved!");
      onComplete();
    } catch (error) {
      toast.error("Failed to save language preference");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Duck and Cat!</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select your preferred language</label>
            <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
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
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 