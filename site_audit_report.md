# Site Audit Report

## Executive summary

- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.
- Search Console foundations exist in code: `robots`, `sitemap`, `manifest`, `JSON-LD`, and `google-site-verification` support.
- The current repo still has several meaningful gaps affecting security and indexing quality.

## High severity

### AUDIT-001: Stored XSS risk in CMS and blog HTML rendering

- Location:
  - `src/components/ManagedPage.tsx:61`
  - `src/components/ManagedPage.tsx:93`
  - `src/components/ManagedPage.tsx:136`
  - `src/components/ManagedPage.tsx:186`
  - `src/components/ManagedPage.tsx:193`
  - `src/app/blog/[slug]/page.tsx:38`
  - `src/app/blog/[slug]/page.tsx:359`
- Evidence:
  - The code only removes `<script>...</script>` tags and then injects HTML with `dangerouslySetInnerHTML`.
  - `schemaJson` is also injected directly into a script tag without validation.
- Impact:
  - Stored content containing event handlers, malicious links, `iframe`, SVG payloads, or a crafted `</script>` break-out can execute in visitors' browsers.
- Fix:
  - Replace regex stripping with a real HTML sanitizer.
  - Treat `schemaJson` as validated JSON only; parse and re-serialize it before rendering.

### AUDIT-002: Product and blog detail pages are client-only, which weakens crawlability and route-level SEO

- Location:
  - `src/app/urun/[slug]/page.tsx:1`
  - `src/app/urun/[slug]/page.tsx:158`
  - `src/app/urun/[slug]/page.tsx:163`
  - `src/app/blog/[slug]/page.tsx:1`
  - `src/app/blog/[slug]/page.tsx:64`
  - `src/app/blog/[slug]/page.tsx:69`
  - metadata definitions are only visible in:
    - `src/app/page.tsx:5`
    - `src/app/layout.tsx:21`
    - `src/app/galeri/layout.tsx:4`
    - `src/app/visualizer/layout.tsx:4`
- Evidence:
  - Both detail routes are `'use client'` pages and fetch their content after mount.
  - There is no route-level `generateMetadata` for `/urun/[slug]` or `/blog/[slug]`.
- Impact:
  - Bots receive a thin shell first, not rich server-rendered content with canonical/title/description/Open Graph for each item.
  - This is a direct Search Console and indexing quality problem.
- Fix:
  - Move product/blog detail fetching to server components.
  - Add `generateMetadata` per slug.
  - Keep only interactive pieces on the client.

## Medium severity

### AUDIT-003: Sitemap omits important indexable pages

- Location:
  - `src/app/sitemap.ts:10`
  - `src/app/sitemap.ts:18`
  - `src/app/sitemap.ts:24`
  - `src/app/sitemap.ts:41`
  - `src/app/sitemap.ts:53`
- Evidence:
  - Static sitemap entries only include `/`, `/galeri`, `/visualizer`.
  - Product pages are added dynamically, but `hakkimizda`, `koleksiyonlar`, `blog`, and `sikca-sorulan-sorular` are missing.
- Impact:
  - Search Console sees a weaker discovery signal than it should.
  - Important evergreen pages may be crawled later or less reliably.
- Fix:
  - Add all public evergreen routes to `staticPages`.
  - Consider adding published blog detail URLs as well.

### AUDIT-004: Canonical/base URL defaults to non-www, which can split Search Console signals

- Location:
  - `src/lib/site.ts:1`
  - `src/lib/site.ts:4`
  - `src/app/layout.tsx:22`
  - `src/app/layout.tsx:94`
  - `src/components/JsonLd.tsx:49`
- Evidence:
  - Default site URL is `https://televiperde.com`.
  - Layout canonical and JSON-LD use `SITE_URL`.
  - Live production has been deployed under `https://www.televiperde.com`.
- Impact:
  - If Vercel env does not override this in production, canonicals, sitemap URLs and structured data may point to the wrong host.
  - Search Console can treat `www` and non-`www` as separate properties/signals.
- Fix:
  - Set one canonical origin everywhere, preferably the actual production host.
  - Enforce a single host at the edge with redirects.

### AUDIT-005: Public email enumeration endpoint exists

- Location:
  - `src/app/api/auth/register/route.ts:87`
  - `src/app/api/auth/register/route.ts:89`
  - `src/app/api/auth/register/route.ts:105`
  - `src/app/api/auth/register/route.ts:110`
- Evidence:
  - `GET /api/auth/register?email=...` returns `{ exists: true|false }` for arbitrary emails.
- Impact:
  - Attackers can enumerate registered users and pair that with credential stuffing or phishing.
- Fix:
  - Remove the public existence check, or gate it behind rate limits and a neutral response.

### AUDIT-006: Newsletter unsubscribe endpoint can be abused by anyone who knows an email

- Location:
  - `src/app/api/newsletter/route.ts:76`
  - `src/app/api/newsletter/route.ts:79`
  - `src/app/api/newsletter/route.ts:90`
- Evidence:
  - `DELETE /api/newsletter?email=...` directly sets `active: false` with no auth or signed unsubscribe token.
- Impact:
  - Anyone can unsubscribe other users by guessing or knowing their email address.
- Fix:
  - Use a signed unsubscribe token or a verified email workflow.

### AUDIT-007: Public write endpoints and login flow show no visible rate limiting or anti-spam controls

- Location:
  - `src/lib/auth-options.ts:38`
  - `src/app/api/auth/register/route.ts:5`
  - `src/app/api/contact/route.ts:6`
  - `src/app/api/quote/route.ts:6`
  - `src/app/api/newsletter/route.ts:6`
- Evidence:
  - Public auth/contact/newsletter/quote handlers accept requests directly.
  - No rate limiter, CAPTCHA, abuse scoring, or origin validation is visible in app code.
- Impact:
  - Brute force, signup spam, form spam and DB pollution risks are materially higher.
- Fix:
  - Add IP/user-agent based throttling and bot protection.
  - For cookie-authenticated mutations, add Origin checks or CSRF tokens where appropriate.

## Low severity

### AUDIT-008: SearchAction structured data points to a search URL that does not exist as a real search results page

- Location:
  - `src/components/JsonLd.tsx:49`
- Evidence:
  - `WebSite` schema exposes `urlTemplate: ${SITE_URL}/?q={search_term_string}`.
  - The site uses a modal/client search flow rather than a crawlable search results page.
- Impact:
  - Search Console rich result validation can flag the sitelinks searchbox target as invalid or unhelpful.
- Fix:
  - Either build a real `/arama?q=` page or remove the `SearchAction`.

### AUDIT-009: Two robots configurations exist, which invites configuration drift

- Location:
  - `src/app/robots.ts:4`
  - `public/robots.txt:1`
- Evidence:
  - App Router generates `/robots.txt`, but a separate static `public/robots.txt` also exists with different rules.
- Impact:
  - This is easy to forget and creates operational confusion.
- Fix:
  - Keep a single source of truth for robots policy.

## Positive notes

- Admin-only API surfaces consistently use `requireAdmin`.
- Next.js version is current enough to avoid the older known branch vulnerability called out in the reference spec.
- Search Console verification support exists through `metadata.verification.google`.
- `robots`, `sitemap`, `manifest`, Open Graph and JSON-LD infrastructure are present.

## Residual risks / things not proven from app code

- No CSP or broader security header policy is visible in repo code. This may still be configured at Vercel/edge level; verify runtime headers.
- I did not verify live Search Console property state, index coverage, Core Web Vitals, or actual canonical headers from Google’s perspective, because that requires Search Console/runtime access.
- I did not run `npm audit`; dependency advisory status was not verified in this pass.
