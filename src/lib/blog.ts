import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/i18n/routing";

/**
 * File-backed blog. Posts live in `content/blog/<locale>/<slug>.mdx`.
 *
 * Adding a post is dropping in a file — no database, no CMS, no rebuild of any
 * index. If a post exists in Turkish but not yet in English, the English site
 * falls back to the Turkish file rather than 404ing, so translation can lag
 * publication without breaking links.
 */

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");
const FALLBACK_LOCALE: Locale = "tr";

export type BlogFrontmatter = {
  title: string;
  description: string;
  /** ISO date, e.g. 2026-03-14 */
  date: string;
  readingMinutes: number;
  cover?: string;
  coverAlt?: string;
  /** Optional link back to a treatment page. */
  service?: string;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  /** The locale the file was actually read from, which may be the fallback. */
  sourceLocale: Locale;
  body: string;
};

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function readPostFile(
  locale: Locale,
  slug: string
): Promise<{ raw: string; sourceLocale: Locale } | null> {
  const candidates: Locale[] =
    locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE];

  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(
        path.join(BLOG_ROOT, candidate, `${slug}.mdx`),
        "utf8"
      );
      return { raw, sourceLocale: candidate };
    } catch {
      // Try the fallback locale next.
    }
  }
  return null;
}

function parse(
  raw: string,
  slug: string,
  sourceLocale: Locale
): BlogPost | null {
  const { data, content } = matter(raw);
  const front = data as Partial<BlogFrontmatter>;

  // A post missing a title or date is a content error, not a runtime error —
  // skip it rather than rendering a half-empty card.
  if (!front.title || !front.date) return null;

  return {
    slug,
    sourceLocale,
    body: content,
    title: front.title,
    description: front.description ?? "",
    date: front.date,
    readingMinutes: front.readingMinutes ?? estimateReadingMinutes(content),
    cover: front.cover,
    coverAlt: front.coverAlt,
    service: front.service,
  };
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Every slug that exists in any locale — used for generateStaticParams. */
export async function getAllSlugs(): Promise<string[]> {
  const locales: Locale[] = ["tr", "en"];
  const slugs = new Set<string>();

  for (const locale of locales) {
    const files = await readDirSafe(path.join(BLOG_ROOT, locale));
    for (const file of files) {
      if (file.endsWith(".mdx")) slugs.add(file.replace(/\.mdx$/, ""));
    }
  }

  return [...slugs];
}

export async function getPost(
  locale: Locale,
  slug: string
): Promise<BlogPost | null> {
  const file = await readPostFile(locale, slug);
  if (!file) return null;
  return parse(file.raw, slug, file.sourceLocale);
}

/** All posts for a locale, newest first. */
export async function getAllPosts(locale: Locale): Promise<BlogPost[]> {
  const slugs = await getAllSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPost(locale, slug)));

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}
