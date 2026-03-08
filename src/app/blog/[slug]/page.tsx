import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogDetailClient from '@/components/blog/BlogDetailClient'
import { getPublishedBlogBySlug, getRelatedBlogs } from '@/lib/public-catalog'
import { toAbsoluteUrl } from '@/lib/site'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const blog = await getPublishedBlogBySlug(slug)

  if (!blog) {
    return {
      title: 'Blog',
      description: 'ÖzTelevi blog yazısı.',
      alternates: {
        canonical: toAbsoluteUrl(`/blog/${slug}`),
      },
    }
  }

  const description = (blog.excerpt || blog.content.replace(/<[^>]+>/g, ''))
    .slice(0, 160)

  return {
    title: blog.title,
    description,
    alternates: {
      canonical: toAbsoluteUrl(`/blog/${slug}`),
    },
    openGraph: {
      title: `${blog.title} | ÖzTelevi Blog`,
      description,
      url: toAbsoluteUrl(`/blog/${slug}`),
      type: 'article',
      publishedTime: blog.publishedAt || undefined,
      images: blog.image
        ? [
            {
              url: toAbsoluteUrl(blog.image),
              alt: blog.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blog.title} | ÖzTelevi Blog`,
      description,
      images: blog.image ? [toAbsoluteUrl(blog.image)] : undefined,
    },
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params
  const blog = await getPublishedBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  const relatedPosts = await getRelatedBlogs(blog.category, blog.id)

  return (
    <BlogDetailClient
      slug={slug}
      initialBlog={blog}
      initialRelatedPosts={relatedPosts}
    />
  )
}
