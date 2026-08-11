import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation.
 * Always import Link/useRouter from here, never from next/* directly, or the
 * locale prefix gets dropped on navigation.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
