import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Language } from "@/utils/types";

interface TeacherContextType {
  language: Language | null;
  setLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        .select(`
          languages (
            id,
            name,
            code,
            levels,
            created_at
          )
        `)
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data?.languages && data.languages.length > 0) {
        // The languages field is an array with a single item due to the join
        const languageData = data.languages[0] as Language;
        setLanguageState(languageData);
      }
    } catch (error) {
      console.error("Error fetching teacher language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("teachers")
        .update({ language_id: newLanguage.id })
        .eq("id", user.id);

      if (error) throw error;
      setLanguageState(newLanguage);
    } catch (error) {
      console.error("Error updating teacher language:", error);
      throw error;
    }
  };

  return (
    <TeacherContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error("useTeacher must be used within a TeacherProvider");
  }
  return context;
} 