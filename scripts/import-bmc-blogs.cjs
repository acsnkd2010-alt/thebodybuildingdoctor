#!/usr/bin/env node
/**
 * Import WordPress bmc_media posts into MongoDB blogs collection.
 *
 * Usage:
 *   node scripts/import-bmc-blogs.cjs
 *   node scripts/import-bmc-blogs.cjs --file=scripts/data/bmc-media.json
 *   node scripts/import-bmc-blogs.cjs --url=https://triotradellc.com
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { MongoClient } = require('mongodb');

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx);
      let value = trimmed.slice(idx + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function parseArgs() {
  const args = { file: null, url: 'https://triotradellc.com' };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--file=')) args.file = arg.slice('--file='.length);
    if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length).replace(/\/$/, '');
  }
  return args;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeTitle(title) {
  return stripHtml(title);
}

function youtubeIdFromUrl(url) {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function youtubeThumb(videosOrContent) {
  if (Array.isArray(videosOrContent)) {
    for (const video of videosOrContent) {
      const id = youtubeIdFromUrl(video.url);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return '';
  }

  const html = String(videosOrContent || '');
  const embedMatch = html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
  const watchMatch = html.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;
  return '';
}

function excerptFromContent(contentHtml, title) {
  const text = stripHtml(contentHtml);
  if (!text) return title;
  const snippet = text.length > 220 ? `${text.slice(0, 217)}...` : text;
  return snippet === title ? snippet : snippet;
}

function mapWpRestPost(post, order) {
  const thumb =
    post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url ||
    post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ||
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    '';

  const contentHtml = post.content?.rendered ?? '';
  const title = decodeTitle(post.title?.rendered ?? 'Untitled');

  return {
    _id: `bmc-${post.id}`,
    wpId: post.id,
    slug: post.slug,
    title,
    excerpt: stripHtml(post.excerpt?.rendered) || excerptFromContent(contentHtml, title),
    contentHtml,
    thumbnailUrl: thumb || youtubeThumb(contentHtml),
    authorName: 'The Bodybuilding Doctor',
    published: post.status === 'publish',
    publishedAt: post.date ? new Date(post.date) : new Date(),
    order,
    wpLink: post.link ?? '',
    updatedAt: new Date(),
  };
}

function mapCustomExportItem(item, order) {
  const contentHtml = item.content_html ?? '';
  const title = decodeTitle(item.title ?? 'Untitled');
  const thumb = item.thumbnail?.url?.trim() || youtubeThumb(item.videos) || youtubeThumb(contentHtml);

  return {
    _id: `bmc-${item.id}`,
    wpId: item.id,
    slug: item.slug,
    title,
    excerpt: excerptFromContent(contentHtml, title),
    contentHtml,
    thumbnailUrl: thumb,
    authorName: 'The Bodybuilding Doctor',
    published: true,
    publishedAt: item.date ? new Date(item.date) : new Date(Date.now() - order * 86400000),
    order,
    wpLink: item.link ?? '',
    updatedAt: new Date(),
  };
}

async function fetchAllFromWordPress(baseUrl) {
  const url = new URL(`${baseUrl}/wp-json/wp/v2/bmc_media`);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', '1');
  url.searchParams.set('_embed', 'true');
  url.searchParams.set('orderby', 'date');
  url.searchParams.set('order', 'desc');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  const posts = await response.json();
  return posts.map((post, index) => mapWpRestPost(post, index));
}

function loadFromFile(filePath) {
  const absolute = resolve(process.cwd(), filePath);
  const raw = readFileSync(absolute, 'utf-8');
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed.bmc_media;
  if (!Array.isArray(items)) {
    throw new Error('JSON file must be an array or { "bmc_media": [...] }');
  }
  return items.map((item, index) => mapCustomExportItem(item, index));
}

async function main() {
  loadEnvLocal();
  const args = parseArgs();

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';
  if (!uri) {
    console.error('Missing MONGODB_URI in web/.env.local');
    process.exit(1);
  }

  const blogs = args.file
    ? loadFromFile(args.file)
    : await fetchAllFromWordPress(args.url);

  console.log(`Importing ${blogs.length} blog posts...`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('blogs');

  let inserted = 0;
  let updated = 0;

  for (const blog of blogs) {
    const { _id, ...fields } = blog;
    const existing = await collection.findOne({ _id });
    const now = new Date();

    if (existing) {
      await collection.updateOne(
        { _id },
        {
          $set: {
            ...fields,
            updatedAt: now,
          },
        },
      );
      updated += 1;
    } else {
      await collection.insertOne({
        _id,
        ...fields,
        createdAt: now,
      });
      inserted += 1;
    }
  }

  await client.close();
  console.log(`Done. Inserted: ${inserted}, updated: ${updated}, total: ${blogs.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
