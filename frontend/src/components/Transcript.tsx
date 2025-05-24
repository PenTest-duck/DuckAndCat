import { Cpu, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TranscriptProps {
  messages: Message[];
}

export default function Transcript({ messages }: TranscriptProps) {
  return (
    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="mt-1">
            {message.role === "user" ? (
              <User className="h-5 w-5 text-blue-500" />
            ) : (
              <Cpu className="h-5 w-5 text-purple-500" />
            )}
          </div>
          <div className="flex-1 rounded-lg bg-white/10 p-3">
            <p className="text-sm text-gray-200">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 