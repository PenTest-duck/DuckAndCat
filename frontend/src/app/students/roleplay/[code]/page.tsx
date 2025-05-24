"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { getStorageUrl } from "@/utils/utils";

interface Roleplay {
  id: string;
  name: string;
  scenario: string;
  image_path: string | null;
  first_prompt: string | null;
}

export default function RoleplayPage() {
  const params = useParams();
  const code = params.code as string;
  const [roleplay, setRoleplay] = useState<Roleplay | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRoleplay();
  }, [code]);

  const fetchRoleplay = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roleplays")
        .select("*")
        .eq("code", code)
        .single();

      if (error) throw error;
      setRoleplay(data);

      if (data.image_path) {
        const signedUrl = await getStorageUrl(data.image_path);
        setImageUrl(signedUrl);
      }
    } catch (error) {
      toast.error("Failed to fetch roleplay");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (roleplay?.first_prompt) {
      router.push(`/students/roleplay/${code}/chat`);
    } else {
      toast.error("This roleplay is not properly configured");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!roleplay) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Roleplay Not Found</h1>
          <p>The roleplay you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      {imageUrl && (
        <div className="fixed inset-0 z-0">
          <Image
            src={imageUrl}
            alt="Roleplay background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Centered Dialog */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Dialog open={true}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{roleplay.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 whitespace-pre-wrap">{roleplay.scenario}</p>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleStart}
              >
                Start Roleplay
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
