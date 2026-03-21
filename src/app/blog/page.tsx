import type { Metadata } from "next";
import { getAllPosts } from "@/lib/wp";
import PostCard from "@/components/PostCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "All posts",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts(24);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-10 text-4xl font-bold tracking-tight text-gray-900">Blog</h1>

      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 py-24 text-center text-gray-400">
          <p className="text-lg font-medium">No posts published yet.</p>
          <p className="mt-2 text-sm">Publish posts in your WordPress dashboard — they'll show up here automatically.</p>
        </div>
      )}
    </div>
  );
}
