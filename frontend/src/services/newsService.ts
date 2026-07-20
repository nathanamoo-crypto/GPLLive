import api from './api';
import { NewsEndpoints, NEWS_URL } from '../constants/apiUrls';
import { Article, NewsItem } from '../types';

// Backend's NewsArticleResponse shape (domain/news/dto/NewsArticleResponse.java):
// id, headline, summary, imageUrl, source, publishedAt, url. It fetches and
// parses GhanaSoccernet's GPL RSS feed live on every call - no caching on
// either side - so calling this again (e.g. on pull-to-refresh) always
// reflects whatever's currently live on the source site.

// WordPress feed XML is pretty-printed and titles aren't always
// CDATA-wrapped, so leading/trailing whitespace (and occasionally an
// invisible character like a zero-width space or BOM) from the source XML
// can leak into the title text. Left in, the headline renders visibly
// indented compared to the category/source lines around it (which are
// always clean strings). Trimmed here too as a client-side backstop in case
// the backend hasn't been restarted with its own fix yet.
// Built from character codes rather than pasted characters so this is
// unambiguous in source control: 0x200B zero-width space, 0xFEFF BOM,
// 0x00A0 non-breaking space.
const INVISIBLE_CHARS = String.fromCharCode(0x200b, 0xfeff, 0x00a0);
const LEADING_TRAILING_INVISIBLES = new RegExp(
  '^[\\s' + INVISIBLE_CHARS + ']+|[\\s' + INVISIBLE_CHARS + ']+$',
  'g'
);

function cleanHeadline(raw: string): string {
  return raw.replace(LEADING_TRAILING_INVISIBLES, '');
}

function mapArticle(raw: any): Article {
  return {
    id: raw.id ?? raw.url,
    headline: cleanHeadline(raw.headline ?? 'Untitled'),
    body: raw.summary ?? '',
    thumbnailUrl: raw.imageUrl ?? '',
    // The feed is already scoped to GPL news specifically, so every
    // article fetched this way is tagged the same - there's no per-article
    // category signal in the RSS data itself to split further.
    category: 'GPL',
    source: raw.source ?? 'GhanaSoccernet',
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    url: raw.url,
  };
}

// `page` is accepted server-side but GhanaSoccernet's feed doesn't actually
// honor it (confirmed - it returns the same set regardless), so callers
// should treat this as always returning the source's current latest
// articles. See shuffleArticles below for how screens give pull-to-refresh
// a visible effect anyway.
export async function fetchNews(signal?: AbortSignal, page: number = 1): Promise<Article[]> {
  const { data } = await api.get<any[]>(NewsEndpoints.LATEST, {
    baseURL: NEWS_URL,
    signal,
    params: { page },
  });
  return (data ?? []).map(mapArticle);
}

// Since the source feed only ever exposes its current ~10-20 latest
// articles (no real pagination), refreshing re-fetches live (so anything
// genuinely new shows up) and then shuffles the order of the real articles
// returned, so pull-to-refresh always visibly changes what's on screen
// instead of looking frozen when the source hasn't published anything new
// since the last pull. Shared between NewsScreen and the Home widget so
// both refresh the same way.
export function shuffleArticles<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Kept for the Home screen's "Latest News" widget, which only needs the
// list-row shape (no body/thumbnail) - reuses the same live fetch.
export const getLatestNews = async (signal?: AbortSignal): Promise<NewsItem[]> => {
  const articles = await fetchNews(signal);
  return articles.map((a) => ({
    id: a.id,
    headline: a.headline,
    source: a.source,
    category: a.category,
    time: new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }));
};
