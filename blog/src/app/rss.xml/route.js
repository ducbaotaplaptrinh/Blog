import { getPublishedPosts } from '@/lib/api';
import { getExcerpt } from '@/lib/utils';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let posts = [];

  try {
    const res = await getPublishedPosts({ limit: 30 });
    posts = res?.data || [];
  } catch (err) {
    posts = [];
  }

  const itemsXml = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${getExcerpt(post.content, 200)}]]></description>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <author><![CDATA[${post.author_name || 'TechInsight'}]]></author>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TechInsight Blog</title>
    <link>${siteUrl}</link>
    <description>Khám phá công nghệ, kỹ thuật lập trình và kiến trúc hệ thống hiện đại.</description>
    <language>vi-VN</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
