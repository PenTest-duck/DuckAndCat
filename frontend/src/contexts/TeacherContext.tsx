"use client"

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
    console.log("TeacherProvider useEffect - user:", user?.id);
    if (user) {
      fetchTeacherLanguage();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTeacherLanguage = async () => {
    try {
      console.log("Fetching teacher language for user:", user?.id);
      const supabase = createClient();
      
      // First, get the teacher's language_id
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("language_id")
        .eq("id", user?.id)
        .single();

      if (teacherError) {
        console.error("Error fetching teacher:", teacherError);
        throw teacherError;
      }

      if (!teacherData?.language_id) {
        console.log("No language_id found for teacher");
        setIsLoading(false);
        return;
      }

      // Then, get the language details
      const { data: languageData, error: languageError } = await supabase
        .from("languages")
        .select("*")
        .eq("id", teacherData.language_id)
        .single();

      if (languageError) {
        console.error("Error fetching language:", languageError);
        throw languageError;
      }

      if (languageData) {
        console.log("Setting language state to:", languageData);
        setLanguageState(languageData);
      } else {
        console.log("No language data found");
      }
    } catch (error) {
      console.error("Error in fetchTeacherLanguage:", error);
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