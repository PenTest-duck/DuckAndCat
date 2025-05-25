import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getStorageUrl } from "@/utils/utils";
import { Roleplay } from "@/utils/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConversationList } from "./ConversationList";

interface RoleplayCardProps {
  roleplay: Roleplay;
}

export function RoleplayCard({ roleplay }: RoleplayCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (roleplay.image_path) {
        const url = await getStorageUrl(roleplay.image_path);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [roleplay.image_path]);

  const openRoleplay = () => {
    const link = `${window.location.origin}/students/roleplay/${roleplay.code}`;
    window.open(link, '_blank');
  };

  const copyLink = () => {
    const link = `${window.location.origin}/students/roleplay/${roleplay.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-base">{roleplay.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={roleplay.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-3">{roleplay.scenario}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={openRoleplay}
              className="flex items-center gap-1.5 h-8"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Button>
            <TooltipProvider delayDuration={0.5}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={copyLink}
                    className="h-8 w-8 -ml-1 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0.5}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => setIsConversationListOpen(true)}
                    className="h-8 w-8 -ml-1 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Conversations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(roleplay.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      {roleplay.agent_id && (
        <ConversationList
          runId={roleplay.agent_id}
          isOpen={isConversationListOpen}
          onClose={() => setIsConversationListOpen(false)}
        />
      )}
    </Card>
  );
}