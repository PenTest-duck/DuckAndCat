import { createClient } from "./supabase/client";

export const getStorageUrl = async (path: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("roleplay")
    .createSignedUrl(path, 3600); // URL valid for 1 hour

  if (error) {
    console.error("Error getting signed URL:", error);
    return "";
  }

  return data.signedUrl;
};
