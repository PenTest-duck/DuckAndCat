import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface RoleplayCardProps {
  roleplay: {
    id: string;
    name: string;
    scenario: string;
    code: string | null;
    created_at: string;
  };
}

export function RoleplayCard({ roleplay }: RoleplayCardProps) {
  const copyLink = () => {
    const link = `${window.location.origin}/roleplay/${roleplay.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{roleplay.name}</CardTitle>
        <CardDescription>
          Created on {new Date(roleplay.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{roleplay.scenario}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
      </CardContent>
    </Card>
  );
}