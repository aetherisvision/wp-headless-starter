import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug, getAllPostSlugs, formatDate, stripHtml } from "@/lib/wp";

export const revalidate = 300;

// Pre-generate all published post pages at build time
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Per-post metadata from WP
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const description = stripHtml(post.excerpt).slice(0, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: post.featuredImage
        ? [{ url: post.featuredImage.node.sourceUrl, alt: post.featuredImage.node.altText }]
        : [],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const category = post.categories.nodes[0];

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {/* Category */}
      {category && (
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-blue-600">
          {category.name}
        </span>
      )}

      {/* Title */}
      <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
        {post.title}
      </h1>

      {/* Byline */}
      <div className="mb-8 flex items-center gap-3 text-sm text-gray-400">
        <span className="font-medium text-gray-600">{post.author.node.name}</span>
        <span>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.modified !== post.date && (
          <>
            <span>·</span>
            <span>Updated {formatDate(post.modified)}</span>
          </>
        )}
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative mb-10 h-72 w-full overflow-hidden rounded-xl sm:h-96">
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {/* Post content — WP HTML rendered as-is; .wp-content provides typography */}
      <div
        className="wp-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Back link */}
      <div className="mt-16 border-t border-gray-100 pt-8">
        <a href="/blog" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to all posts
        </a>
      </div>
    </article>
  );
}
