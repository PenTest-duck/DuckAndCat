import { User } from "lucide-react";
import { useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatAdjustedDate } from "@/utils/date";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TranscriptProps {
  messages: Message[];
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export default function Transcript({ messages, isVisible, onVisibilityChange }: TranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = () => {
    return formatAdjustedDate(new Date(), {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isVisible) {
    return (
      <div className="flex items-center justify-end gap-2 p-2">
        <Label htmlFor="transcript-toggle" className="text-sm text-gray-400">
          Show Transcript
        </Label>
        <Switch
          id="transcript-toggle"
          checked={isVisible}
          onCheckedChange={onVisibilityChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2 p-2">
        <Label htmlFor="transcript-toggle" className="text-sm text-gray-400">
          Hide Transcript
        </Label>
        <Switch
          id="transcript-toggle"
          checked={isVisible}
          onCheckedChange={onVisibilityChange}
        />
      </div>
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto p-4 bg-gray-100 rounded-lg backdrop-blur-sm border border-gray-200/20">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="mt-1">
                <User className="h-5 w-5 text-purple-500" />
              </div>
            )}
            <div className={`flex flex-col max-w-[80%] ${
              message.role === "user" ? "items-end" : "items-start"
            }`}>
              <div className={`flex items-center gap-2 mb-1 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}>
                <span className="text-xs text-gray-600">
                  {message.role === "user" ? "You" : "AI"}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime()}
                </span>
              </div>
              <div className={`rounded-lg p-3 ${
                message.role === "user" 
                  ? "bg-blue-600/90 text-white" 
                  : "bg-gray-200/80 text-gray-800"
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
            {message.role === "user" && (
              <div className="mt-1">
                <User className="h-5 w-5 text-blue-500" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 