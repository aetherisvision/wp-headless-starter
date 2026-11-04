# wp-headless-starter

**Next.js 16 + WPGraphQL starter template** by Aetheris Vision LLC.

WordPress manages all content. Next.js renders the frontend at edge speed.
Editors use the familiar WP dashboard. Visitors get a Lighthouse 95+ experience.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| CMS Backend | WordPress + WPGraphQL plugin |
| Deployment | Vercel (frontend) + any WP host |
| Image optimization | `next/image` with remote patterns |
| ISR | 60s (listings) / 300s (single posts) + on-demand webhook |

(AV's own sites run on Google Cloud; Vercel here is the template's default for client sites.)

---

## Quick Start

### 1 — Clone and install

```bash
git clone https://github.com/marstonsward/wp-headless-starter.git my-project
cd my-project
npm install
```

### 2 — Set up WordPress backend

You need a WordPress install with WPGraphQL configured:

**Hosting options (pick one):**
- **DigitalOcean** — 1-click WordPress droplet, $6/mo. Fast to spin up.
- **WP Engine** — Managed WP hosting. Agency program available.
- **Kinsta** — Premium managed WP. Per-site plans.
- **Local dev** — Run WP locally with [LocalWP](https://localwp.com/), expose via `ngrok` for Vercel.

**WordPress plugins to install:**
1. [WPGraphQL](https://wordpress.org/plugins/wp-graphql/) — free, required
2. [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) — free, for custom fields
3. [WPGraphQL for ACF](https://github.com/wp-graphql/wpgraphql-acf) — free, exposes ACF in GraphQL
4. [Wordfence Security](https://wordpress.org/plugins/wordfence/) — free, harden the WP admin

**After installing WPGraphQL:**
- Go to WordPress admin → Settings → Permalinks → Save (enables pretty permalinks)
- WPGraphQL endpoint is now live at `https://your-wp-site.com/graphql`
- Confirm at: `https://your-wp-site.com/graphiql` (GraphQL playground)

### 3 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
WORDPRESS_API_URL=https://your-wp-site.com/graphql
REVALIDATE_SECRET=your-random-secret-string
```

Generate a secret: `openssl rand -hex 32`

### 4 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Posts from WordPress appear automatically.

---

## Deploy to Vercel

### One-time setup

```bash
npx vercel link          # Connect to Vercel project
npx vercel env add WORDPRESS_API_URL
npx vercel env add REVALIDATE_SECRET
```

Or set environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

### Deploy

```bash
git push origin main     # Vercel auto-deploys on push
```

### On-demand revalidation (live updates from WP)

Add this to your WordPress theme's `functions.php` or a custom plugin:

```php
<?php
// Trigger Next.js revalidation on post publish/update
add_action('save_post', function($post_id, $post) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if ($post->post_status !== 'publish') return;

    $secret    = defined('HEADLESS_REVALIDATE_SECRET') ? HEADLESS_REVALIDATE_SECRET : '';
    $vercel_url = defined('HEADLESS_FRONTEND_URL') ? HEADLESS_FRONTEND_URL : '';

    if (!$secret || !$vercel_url) return;

    wp_remote_post($vercel_url . '/api/revalidate', [
        'headers'  => ['Content-Type' => 'application/json'],
        'body'     => json_encode([
            'secret' => $secret,
            'type'   => $post->post_type,
            'slug'   => $post->post_name,
        ]),
        'blocking' => false,
        'timeout'  => 5,
    ]);
}, 10, 2);
```

Add to WordPress `wp-config.php`:

```php
define('HEADLESS_REVALIDATE_SECRET', 'your-secret-here');  // Must match REVALIDATE_SECRET in Vercel
define('HEADLESS_FRONTEND_URL', 'https://your-vercel-site.vercel.app');
```

---

## Adding Custom Post Types

For client projects with custom content (events, listings, team members, menus, etc.):

1. Register the CPT in WordPress (functions.php or CPT UI plugin)
2. Create an ACF field group for it; assign to the CPT
3. Add a query function in `src/lib/wp.ts`
4. Create a route in `src/app/[cpt-slug]/[slug]/page.tsx`

See `src/lib/wp.ts` for the fetch pattern — all queries follow the same structure.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout — Header + Footer
│   ├── page.tsx                Homepage — recent posts from WP
│   ├── blog/
│   │   ├── page.tsx            Blog index
│   │   └── [slug]/page.tsx     Single post (ISR + on-demand revalidation)
│   ├── [slug]/page.tsx         WP Pages (About, Contact, etc.)
│   └── api/revalidate/route.ts Webhook receiver for on-demand ISR
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── PostCard.tsx
└── lib/
    └── wp.ts                   All WPGraphQL queries + TypeScript types
```

---

## Per-Client Customization

When cloning for a client project:

1. Update `Header.tsx` — site name, navigation links
2. Update `Footer.tsx` — copyright, links
3. Update `page.tsx` homepage hero text
4. Add client-specific CPT queries to `wp.ts`
5. Adjust Tailwind colors/fonts to client brand
6. Set `WORDPRESS_API_URL` to client's WP instance in Vercel

---

## Aetheris Vision LLC

Built and maintained by [Aetheris Vision LLC](https://aetherisvision.com) — web development for serious businesses.
