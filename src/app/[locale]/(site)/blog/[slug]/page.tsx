import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getAllSlugs, getPost } from "@/lib/blog";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale as Locale, slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
      languages: { tr: `/blog/${slug}`, en: `/en/blog/${slug}` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
  };
}

/**
 * Components available to MDX. Internal links use next/link with the href
 * exactly as written in the file — the posts already carry their own locale
 * prefix, so routing them through the locale-aware Link would double it.
 */
const mdxComponents = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    const isInternal = href.startsWith("/");
    if (isInternal) return <NextLink href={href} {...props} />;
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const activeLocale = (await getLocale()) as Locale;
  const post = await getPost(activeLocale, slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const { content } = await compileMDX({
    source: post.body,
    components: mdxComponents,
  });

  const formattedDate = new Intl.DateTimeFormat(
    activeLocale === "tr" ? "tr-TR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  ).format(new Date(post.date));

  return (
    <main className="pt-20">
      <Section tone="base" className="bg-glow overflow-hidden">
        <div className="container-page">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-brand"
            >
              <span aria-hidden>←</span>
              {t("backToAll")}
            </Link>
          </Reveal>

          <article className="mt-10">
            <header className="mx-auto max-w-3xl">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  <time dateTime={post.date}>{formattedDate}</time>
                  {" · "}
                  {post.readingMinutes} {t("readingTime")}
                </p>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-5 display-md leading-[1.05]">
                  {post.title}
                </h1>
              </Reveal>

              {post.description ? (
                <Reveal delay={0.1}>
                  <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                    {post.description}
                  </p>
                </Reveal>
              ) : null}
            </header>

            {post.cover ? (
              <Reveal delay={0.12}>
                <Figure
                  src={post.cover}
                  alt={post.coverAlt ?? post.title}
                  className="mt-12 aspect-[16/9] w-full rounded-[var(--radius-image)]"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              </Reveal>
            ) : null}

            <div className="prose-clinic mx-auto mt-14">{content}</div>

            <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-8">
              <p className="text-xs leading-relaxed text-muted">
                {t("disclaimer")}
              </p>

              {post.service ? (
                <div className="mt-8">
                  <ButtonLink href={`/randevu?service=${post.service}`}>
                    {(await getTranslations("nav"))("book")}
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </Section>
    </main>
  );
}
