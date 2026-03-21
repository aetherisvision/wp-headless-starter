/**
 * wp.ts — WPGraphQL data layer
 *
 * All WordPress data fetching goes through this file.
 * Add new query functions here as client projects require additional post types,
 * ACF fields, menus, or custom data.
 *
 * ISR strategy:
 *   - Listings (post lists, page indexes): revalidate every 60s
 *   - Single posts/pages: revalidate every 300s + on-demand via /api/revalidate
 *
 * Docs: https://www.wpgraphql.com/docs
 */

const API_URL = process.env.WORDPRESS_API_URL;

if (!API_URL) {
  throw new Error("WORDPRESS_API_URL environment variable is not set.");
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WpImage {
  sourceUrl: string;
  altText: string;
}

export interface WpCategory {
  name: string;
  slug: string;
}

export interface WpAuthor {
  name: string;
  avatar?: { url: string };
}

export interface WpPostSummary {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  featuredImage: { node: WpImage } | null;
  author: { node: WpAuthor };
  categories: { nodes: WpCategory[] };
}

export interface WpPost extends WpPostSummary {
  content: string;
  modified: string;
}

export interface WpPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  date: string;
  modified: string;
}

export interface WpSiteSettings {
  generalSettingsTitle: string;
  generalSettingsDescription: string;
  generalSettingsUrl: string;
}

// ── Core fetch ─────────────────────────────────────────────────────────────────

async function fetchAPI<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60
): Promise<T> {
  const res = await fetch(API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`WPGraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`WPGraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

// ── Posts ──────────────────────────────────────────────────────────────────────

/** Fetch the N most recent posts (default 12). Used for homepage and blog index. */
export async function getAllPosts(first = 12): Promise<WpPostSummary[]> {
  const data = await fetchAPI<{ posts: { nodes: WpPostSummary[] } }>(
    `
    query AllPosts($first: Int!) {
      posts(first: $first, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
        nodes {
          id
          slug
          title
          date
          excerpt
          featuredImage { node { sourceUrl altText } }
          author { node { name avatar { url } } }
          categories { nodes { name slug } }
        }
      }
    }
  `,
    { first },
    60
  );
  return data.posts.nodes;
}

/** Fetch a single post by slug. Used for /blog/[slug]. */
export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const data = await fetchAPI<{ post: WpPost | null }>(
    `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        slug
        title
        date
        modified
        excerpt
        content
        featuredImage { node { sourceUrl altText } }
        author { node { name avatar { url } } }
        categories { nodes { name slug } }
      }
    }
  `,
    { slug },
    300
  );
  return data.post;
}

/** Fetch all post slugs — used for generateStaticParams. */
export async function getAllPostSlugs(): Promise<string[]> {
  const data = await fetchAPI<{ posts: { nodes: { slug: string }[] } }>(
    `
    query AllPostSlugs {
      posts(first: 1000, where: { status: PUBLISH }) {
        nodes { slug }
      }
    }
  `,
    {},
    3600
  );
  return data.posts.nodes.map((n) => n.slug);
}

// ── Pages ──────────────────────────────────────────────────────────────────────

/** Fetch a WordPress page by URI slug. Used for /[slug]. */
export async function getPageBySlug(slug: string): Promise<WpPage | null> {
  const data = await fetchAPI<{ page: WpPage | null }>(
    `
    query PageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        id
        slug
        title
        content
        date
        modified
      }
    }
  `,
    { slug },
    300
  );
  return data.page;
}

/** Fetch all page slugs for generateStaticParams. Excludes common reserved slugs. */
export async function getAllPageSlugs(): Promise<string[]> {
  const data = await fetchAPI<{ pages: { nodes: { slug: string }[] } }>(
    `
    query AllPageSlugs {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes { slug }
      }
    }
  `,
    {},
    3600
  );
  const reserved = new Set(["blog", "home", "front-page"]);
  return data.pages.nodes
    .map((n) => n.slug)
    .filter((s) => !reserved.has(s));
}

// ── Site Settings ──────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<WpSiteSettings> {
  const data = await fetchAPI<WpSiteSettings>(
    `
    query SiteSettings {
      generalSettingsTitle
      generalSettingsDescription
      generalSettingsUrl
    }
  `,
    {},
    3600
  );
  return data;
}

// ── Utilities ──────────────────────────────────────────────────────────────────

/** Format a WP date string for display. */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Strip HTML tags from WP excerpt (WP wraps excerpts in <p> tags). */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
