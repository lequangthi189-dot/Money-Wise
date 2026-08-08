import { supabase } from "../models/supabase";

function validFontSize(value) {
  const size = Number(value) || 16;
  return Math.min(20, Math.max(14, size));
}

export async function fetchSettings() {
  const { data, error } = await supabase.auth.getUser();
  if (error && !String(error.message).toLowerCase().includes("session")) throw error;
  const metadata = data?.user?.user_metadata ?? {};
  return { theme: metadata.theme ?? "glass", language: metadata.language ?? "vi", fontSize: validFontSize(metadata.font_size) };
}

export async function saveSettings({ theme, language, fontSize }) {
  const { error } = await supabase.auth.updateUser({ data: { theme, language, font_size: validFontSize(fontSize) } });
  if (error) throw error;
}
