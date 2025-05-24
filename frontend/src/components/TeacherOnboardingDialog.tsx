"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Language } from "@/utils/types";

interface TeacherOnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function TeacherOnboardingDialog({ open, onComplete }: TeacherOnboardingDialogProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
          // Set default language to English if available
          const english = data.find(lang => lang.code === "EN");
          if (english) {
            setSelectedLanguageId(english.id);
          }
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        toast.error("Failed to load languages");
      }
    };

    fetchLanguages();
  }, []);

  const handleSubmit = async () => {
    if (!selectedLanguageId) {
      toast.error("Please select a language");
      return;
    }

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
            language_id: selectedLanguageId,
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
            <label className="text-sm font-medium">Select your language</label>
            <Select value={selectedLanguageId} onValueChange={setSelectedLanguageId}>
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
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isLoading || !selectedLanguageId}
          >
            {isLoading ? "Saving..." : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 