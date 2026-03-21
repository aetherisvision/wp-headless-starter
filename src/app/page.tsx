import { getAllPosts } from "@/lib/wp";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts(6);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
          Welcome to MySite
        </h1>
        <p className="mx-auto max-w-xl text-lg text-gray-500">
          Replace this with your site tagline — or pull it from WP General Settings.
        </p>
      </div>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section>
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
            <Link href="/blog" className="text-sm font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-24 text-center text-gray-400">
          <p className="text-lg font-medium">No posts yet.</p>
          <p className="mt-2 text-sm">Add posts in your WordPress dashboard and they'll appear here.</p>
        </div>
      )}
    </div>
  );
}
