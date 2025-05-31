import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import {
  listConversations,
  getConversation,
  getConversationAudio,
} from "@/utils/api/client";
import { toast } from "sonner";
import { formatAdjustedDate } from "@/utils/date";

interface Conversation {
    conversation_id: string;
    transcript: Array<{
        role: string;
        message: string;
    }>;
}

interface ConversationListItem {
  agent_id: string;
  agent_name: string;
  conversation_id: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  messsage_count: number;
  status: string;
  call_successful: string;
}

interface ConversationListProps {
  runId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationList({
  runId,
  isOpen,
  onClose,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, runId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetails(selectedConversationId);
    }
  }, [selectedConversationId]);

  const fetchConversations = async () => {
    try {
      const data = await listConversations(runId);
      setConversations(data);
    } catch (error) {
      toast.error("Failed to fetch conversations");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationDetails = async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId);
      setSelectedConversation(conversation);

      // Fetch audio
      const audioBlob = await getConversationAudio(conversationId);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Create audio element
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (error) {
      toast.error("Failed to fetch conversation details");
      console.error(error);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateString: string) => {
    return formatAdjustedDate(dateString);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Conversations</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">Loading conversations...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Conversations</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Conversation List</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?.conversation_id === conversation.conversation_id
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => setSelectedConversationId(conversation.conversation_id)}
                >
                  <div className="text-sm font-medium">
                    {formatDate(new Date(conversation.start_time_unix_secs * 1000).toISOString())}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Transcript</h3>
            {selectedConversation ? (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {selectedConversation.transcript.map((message, index) => (
                    <div
                      key={`${selectedConversation.conversation_id}-${index}-${message.role}`}
                      className={`p-2 rounded-lg ${
                        message.role === "agent" ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {message.role === "agent" ? "AI" : "Student"}
                      </div>
                      <div className="text-sm">{message.message}</div>
                    </div>
                  ))}
                </div>
                {audioUrl && (
                  <Button
                    onClick={togglePlayback}
                    className="w-full"
                    variant="outline"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play Recording
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Select a conversation to view transcript
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
