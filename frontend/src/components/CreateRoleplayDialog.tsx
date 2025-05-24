"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  deleteRoleplayPreviews,
  getRoleplayDescription,
  getRoleplayImage,
} from "@/utils/api/client";
import Image from "next/image";
import { useTeacher } from "@/contexts/TeacherContext";
import { getStorageUrl } from "@/utils/utils";

interface CreateRoleplayDialogProps {
  onSuccess?: () => void;
}

interface PreviewData {
  firstPrompt: string;
  imagePath: string;
}

export function CreateRoleplayDialog({ onSuccess }: CreateRoleplayDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const { language } = useTeacher();
  const [imageUrl, setImageUrl] = useState<string>("");

  const resetForm = () => {
    setName("");
    setScenario("");
    setIsLoading(false);
    setIsGenerating(false);
    setIsPreviewing(false);
    setPreviewData(null);
    setHasPreviewed(false);
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPreviewed) {
      toast.error("Please preview the roleplay before creating");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Move image from previews to images directory
      if (previewData?.imagePath) {
        const imageName = previewData.imagePath.split("/").pop();
        const newImagePath = `${user.id}/images/${imageName}`;

        // Download the image from previews
        const { data: imageData, error: downloadError } = await supabase.storage
          .from("roleplay")
          .download(previewData.imagePath);

        if (downloadError) throw downloadError;

        // Upload to images directory
        const { error: uploadError } = await supabase.storage
          .from("roleplay")
          .upload(newImagePath, imageData);

        if (uploadError) throw uploadError;

        // Update the image path to point to the new location
        previewData.imagePath = newImagePath;
      }

      const { error } = await supabase.from("roleplays").insert([
        {
          name,
          scenario,
          owner_id: user.id,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          first_prompt: previewData?.firstPrompt,
          image_path: previewData?.imagePath,
        },
      ]);
      if (error) throw error;

      const { error: deleteError } = await deleteRoleplayPreviews(user.id);
      if (deleteError) throw deleteError;

      toast.success("Roleplay created successfully!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create roleplay");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!name) {
      toast.error("Please enter a roleplay name first");
      return;
    }

    setIsGenerating(true);
    try {
      if (!language) {
        throw new Error("Teacher language not found");
      }

      const response = await getRoleplayDescription(name, language.name);
      if (response.description) {
        setScenario(response.description);
        toast.success("Scenario generated successfully!");
      } else {
        throw new Error("No description received");
      }
    } catch (error) {
      toast.error("Failed to generate scenario");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!name || !scenario) {
      toast.error("Please fill in both name and scenario");
      return;
    }

    setIsPreviewing(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      if (!language) {
        throw new Error("Teacher language not found");
      }

      const response = await getRoleplayImage(
        user.id,
        name,
        scenario,
        language.name,
      );

      setPreviewData({
        firstPrompt: response.first_prompt,
        imagePath: response.image_path,
      });

      // Get signed URL for the image
      const signedUrl = await getStorageUrl(response.image_path);
      setImageUrl(signedUrl);

      setHasPreviewed(true);
      toast.success("Preview generated successfully!");
    } catch (error) {
      toast.error("Failed to generate preview");
      console.error(error);
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Create New Roleplay</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create New Roleplay</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Preview</h3>
            {previewData ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Roleplay preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        No image available
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Starting Question:</p>
                  <p className="mt-1 text-sm">{previewData.firstPrompt}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Preview will appear here
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasPreviewed(false);
                }}
                placeholder="Enter roleplay name"
                required
              />
            </div>
            <div className="flex flex-1 flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="scenario" className="text-sm font-medium">
                  Scenario
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoGenerate}
                  disabled={isGenerating || !name}
                >
                  {isGenerating ? "Generating..." : "Auto-generate"}
                </Button>
              </div>
              <Textarea
                id="scenario"
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value);
                  setHasPreviewed(false);
                }}
                placeholder="Enter the roleplay scenario"
                required
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
                disabled={isPreviewing || !name || !scenario}
              >
                {isPreviewing ? "Generating Preview..." : "Preview"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !hasPreviewed}
              >
                {isLoading ? "Creating..." : "Create Roleplay"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
