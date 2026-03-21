import Link from "next/link";
import Image from "next/image";
import type { WpPostSummary } from "@/lib/wp";
import { formatDate, stripHtml } from "@/lib/wp";

export default function PostCard({ post }: { post: WpPostSummary }) {
  const category = post.categories.nodes[0];
  const excerpt = stripHtml(post.excerpt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={post.featuredImage.node.sourceUrl}
              alt={post.featuredImage.node.altText || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            {category.name}
          </span>
        )}
        <h2 className="mb-2 text-lg font-bold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {excerpt && (
          <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">{excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span>{post.author.node.name}</span>
          <span>·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </div>
    </article>
  );
}
