import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Figure } from "@/components/ui/Figure";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { getAllPosts } from "@/lib/blog";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("lead") };
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const activeLocale = (await getLocale()) as Locale;
  const posts = await getAllPosts(activeLocale);

  const dateFormatter = new Intl.DateTimeFormat(
    activeLocale === "tr" ? "tr-TR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="pt-20">
      <Section tone="base" className="bg-glow overflow-hidden">
        <div className="container-page">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
              {t("eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 display-lg leading-[1.02]">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t("lead")}
            </p>
          </Reveal>

          <RevealGroup
            as="ul"
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            stagger={0.06}
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
                        {dateFormatter.format(new Date(post.date))}
                      </time>
                      {" · "}
                      {post.readingMinutes} {t("readingTime")}
                    </p>
                    <h2 className="mt-2.5 font-display display-xs leading-snug text-ink">
                      {post.title}
                    </h2>
                    <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-soft">
                      {post.description}
                    </p>
                    <span className="mt-4 border-t border-line pt-4 text-xs font-medium text-brand">
                      {t("readMore")} →
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </main>
  );
}
