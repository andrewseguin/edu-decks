import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the current environment is local development or a `-dev.` subdomain.
 */
export function isDevSite(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  return host.includes("-dev.") || host === "localhost" || host === "127.0.0.1";
}

