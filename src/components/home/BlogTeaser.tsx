import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Figure } from "@/components/ui/Figure";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { getAllPosts } from "@/lib/blog";
import type { Locale } from "@/i18n/routing";

export async function BlogTeaser() {
  const t = await getTranslations("home.blog");
  const tBlog = await getTranslations("blog");
  const locale = (await getLocale()) as Locale;

  const posts = (await getAllPosts(locale)).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <Section tone="base" className="overflow-hidden">
      <div className="container-page">
        <SectionHeader
          ghost={t("ghost")}
          title={t("title")}
          lead={t("lead")}
          className="mb-14"
        />

        <RevealGroup
          as="ul"
          className="grid gap-6 md:grid-cols-3"
          stagger={0.08}
        >
          {posts.map((post) => (
            <RevealItem as="li" key={post.slug} className="h-full">
              <Link
                href={`/blog/${post.slug}`}
                className="card group flex h-full flex-col"
              >
                <div className="card-media overflow-hidden">
                  <Figure
                    src={post.cover ?? "/assets/blog/default.jpg"}
                    alt={post.coverAlt ?? post.title}
                    className="aspect-[16/10] w-full"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-muted">
                    <time dateTime={post.date}>
                      {new Intl.DateTimeFormat(
                        locale === "tr" ? "tr-TR" : "en-GB",
                        { day: "numeric", month: "long", year: "numeric" }
                      ).format(new Date(post.date))}
                    </time>
                    {" · "}
                    {post.readingMinutes} {tBlog("readingTime")}
                  </p>

                  <h3 className="mt-2.5 font-display display-xs leading-snug text-ink">
                    {post.title}
                  </h3>

                  <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-soft">
                    {post.description}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            {t("all")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
