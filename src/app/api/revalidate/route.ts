/**
 * On-demand revalidation webhook
 *
 * WordPress calls this endpoint after a post/page is published or updated.
 * It triggers Next.js to immediately regenerate the affected pages.
 *
 * Setup in WordPress — add to your theme's functions.php or a custom plugin:
 *
 *   add_action('save_post', function($post_id, $post) {
 *     if ($post->post_status !== 'publish') return;
 *     $slug  = $post->post_name;
 *     $type  = $post->post_type; // 'post' or 'page'
 *     $token = defined('HEADLESS_REVALIDATE_SECRET') ? HEADLESS_REVALIDATE_SECRET : '';
 *     wp_remote_post('https://your-vercel-site.vercel.app/api/revalidate', [
 *       'headers' => ['Content-Type' => 'application/json'],
 *       'body'    => json_encode([
 *         'secret' => $token,
 *         'type'   => $type,
 *         'slug'   => $slug,
 *       ]),
 *       'blocking' => false,
 *     ]);
 *   }, 10, 2);
 *
 * In WordPress wp-config.php:
 *   define('HEADLESS_REVALIDATE_SECRET', 'your-secret-here');
 *
 * Environment variables required:
 *   REVALIDATE_SECRET — must match the secret sent by WordPress
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: { secret?: string; type?: string; slug?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Verify secret
  if (body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const { type, slug } = body;

  if (!type || !slug) {
    return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });
  }

  try {
    if (type === "post") {
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/blog");
      revalidatePath("/"); // Homepage shows recent posts
    } else if (type === "page") {
      revalidatePath(`/${slug}`);
    } else {
      // Unknown post type — revalidate everything (safe fallback)
      revalidatePath("/", "layout");
    }

    return NextResponse.json({
      revalidated: true,
      type,
      slug,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
