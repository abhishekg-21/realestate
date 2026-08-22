"use client";

import { createClient } from "@/utils/supabase/client";

export interface UserCache {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  location?: string;
}

const USER_KEY = "pn_account_cache";
const SAVED_KEY = "pn_saved_properties";

// Event names for reactive cross-component synchronization
export const AUTH_CHANGE_EVENT = "pn-auth-change";
export const SAVED_CHANGE_EVENT = "pn-saved-change";

export function getCachedUser(): UserCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserCache;
  } catch {
    return null;
  }
}

export function setCachedUser(user: UserCache): void {
  if (typeof window === "undefined") return;
  try {
    const enriched: UserCache = {
      ...user,
      avatar:
        user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : "U"),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(enriched));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch (e) {
    console.error("Failed to save user cache", e);
  }
}

export function clearCachedUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch (e) {
    console.error("Failed to clear user cache", e);
  }
}

// ─── localStorage (sync, offline-safe) ───────────────────────────────────────

export function getSavedPropertyIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleSavedPropertyId(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSavedPropertyIds();
    const index = current.indexOf(id);
    let updated: string[];
    let isSaved = false;
    if (index === -1) {
      updated = [...current, id];
      isSaved = true;
    } else {
      updated = current.filter((item) => item !== id);
      isSaved = false;
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
    return isSaved;
  } catch {
    return false;
  }
}

export function isPropertySaved(id: string): boolean {
  return getSavedPropertyIds().includes(id);
}

// ─── Supabase DB (async, cross-device) ───────────────────────────────────────

export async function getSavedPropertyIdsDB(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("[getSavedPropertyIdsDB]", error.message);
    return [];
  }

  const ids = (data ?? []).map((row) => row.property_id as string);

  // Keep localStorage in sync for instant UI updates
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
  return ids;
}


// REPLACE the entire toggleSavedPropertyIdDB function:
export async function toggleSavedPropertyIdDB(propertyId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from("saved_properties")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  const current: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");

  if (existing) {
    // Unsave
    await supabase.from("saved_properties").delete().eq("id", existing.id);
    const next = current.filter((i) => i !== propertyId);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
    return false;
  } else {
    // Save
    await supabase
      .from("saved_properties")
      .insert({ user_id: user.id, property_id: propertyId });
    const next = [...current, propertyId];
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
    return true;
  }
}