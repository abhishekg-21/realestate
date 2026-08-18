"use client";

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

export function getSavedPropertyIds(): string[] {
  if (typeof window === "undefined") return ["skyline-worli", "palm-courtyard"];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) {
      // Default initial saved spaces for instant gratification
      const initial = ["skyline-worli", "palm-courtyard"];
      localStorage.setItem(SAVED_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as string[];
  } catch {
    return ["skyline-worli", "palm-courtyard"];
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
  if (typeof window === "undefined") return false;
  const current = getSavedPropertyIds();
  return current.includes(id);
}
