"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getStorageUrl } from "@/utils/utils";
import { useConversation } from "@11labs/react";
import { Roleplay } from "@/utils/types";
import Transcript from "@/components/Transcript";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RoleplayPage() {
  const params = useParams();
  const code = params.code as string;
  const [roleplay, setRoleplay] = useState<Roleplay | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [speed, setSpeed] = useState(2); // 0: slowest, 1: slow, 2: normal, 3: fast, 4: fastest
  const [difficulty, setDifficulty] = useState("HSK3"); // Default to HSK3
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  const speedLabels = ["Slowest", "Slow", "Normal", "Fast", "Fastest"];
  const hskLevels = ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"];

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setIsConversationActive(true);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsConversationActive(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
      setMessages(prev => [...prev, {
        role: message.source === 'ai' ? 'assistant' : 'user',
        content: message.message
      }]);
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error("An error occurred during the conversation");
    },
  });

  const startConversation = useCallback(async () => {
    if (!roleplay?.agent_id) {
      toast.error("The roleplay agent could not be found");
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: roleplay?.agent_id,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, speed, difficulty]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setIsConversationActive(false);
  }, [conversation]);

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

  const handleStart = async () => {
    if (!roleplay?.agent_id) {
      toast.error("This roleplay is not properly configured");
      return;
    }
    
    await startConversation();
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          // Only allow closing if conversation is not active
          if (!isConversationActive) {
            setIsDialogOpen(open);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{roleplay.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!isConversationActive ? (
                <>
                  <p className="text-gray-600 whitespace-pre-wrap">{roleplay.scenario}</p>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Speaking Speed</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[speed]}
                          onValueChange={(value: number[]) => setSpeed(value[0])}
                          min={0}
                          max={4}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 min-w-[60px]">
                          {speedLabels[speed]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select
                        value={difficulty}
                        onValueChange={setDifficulty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {hskLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleStart}
                  >
                    Start Roleplay
                  </Button>
                </>
              ) : (
                <>
                  <Transcript 
                    messages={messages} 
                    isVisible={isTranscriptVisible}
                    onVisibilityChange={setIsTranscriptVisible}
                  />
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="destructive"
                    onClick={stopConversation}
                  >
                    End Roleplay
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
