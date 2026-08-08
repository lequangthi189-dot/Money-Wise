import { supabase } from "../models/supabase";

export async function fetchSettings() {
  const { data, error } = await supabase.auth.getUser();
  if (error && !String(error.message).toLowerCase().includes("session")) throw error;
  const metadata = data?.user?.user_metadata ?? {};
  return { theme: metadata.theme ?? "glass", language: metadata.language ?? "vi", fontSize: Number(metadata.font_size) || 16 };
}

export async function saveSettings({ theme, language, fontSize }) {
  const { error } = await supabase.auth.updateUser({ data: { theme, language, font_size: fontSize } });
  if (error) throw error;
}
