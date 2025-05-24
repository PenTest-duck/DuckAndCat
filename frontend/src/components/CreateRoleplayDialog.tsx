"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { getRoleplayDescription } from "@/utils/api/client";

interface CreateRoleplayDialogProps {
  onSuccess?: () => void;
}

export function CreateRoleplayDialog({ onSuccess }: CreateRoleplayDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const resetForm = () => {
    setName("");
    setScenario("");
    setIsLoading(false);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("roleplays")
        .insert([
          {
            name,
            scenario,
            owner_id: user.id,
            code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          },
        ]);

      if (error) throw error;

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
      const response = await getRoleplayDescription(name, "en");
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

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button>Create New Roleplay</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Roleplay</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter roleplay name"
              required
            />
          </div>
          <div className="space-y-2">
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
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Enter the roleplay scenario"
              required
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Roleplay"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 