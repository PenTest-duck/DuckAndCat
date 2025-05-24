import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getStorageUrl } from "@/utils/utils";
import { Roleplay } from "@/utils/types";

interface RoleplayCardProps {
  roleplay: Roleplay;
}

export function RoleplayCard({ roleplay }: RoleplayCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const loadImage = async () => {
      if (roleplay.image_path) {
        const url = await getStorageUrl(roleplay.image_path);
        setImageUrl(url);
      }
    };
    loadImage();
  }, [roleplay.image_path]);

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
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="flex items-center gap-1.5 h-8"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </Button>
          <span className="text-xs text-gray-500">
            {new Date(roleplay.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}