import { Article, NewsItem } from '../types';
import { DUMMY_NEWS } from '../constants/homeDummyData';

/**
 * MOCK NEWS SERVICE
 * -------------------
 * This layer abstracts data fetching to make future API integration seamless.
 * 
 * TO REVERT/UPDATE: Replace mock returns with real 'api.get()' calls.
 */

// TODO: Replace with API call to /news
export const getLatestNews = async (): Promise<NewsItem[]> => {
  return DUMMY_NEWS;
};

// TODO: Replace with API call to /news/:id
export const getArticleDetails = async (id: string): Promise<Article | null> => {
  // Mock detailed article response
  return {
    id,
    headline: 'Asante Kotoko to Face Hearts of Oak in Season Opener',
    category: 'GPL',
    source: 'GPL Official',
    publishedAt: new Date().toISOString(),
    thumbnailUrl: '',
    author: 'Kwesi Appiah',
    body: 'Detailed article content placeholder...',
    url: 'https://gpl.com.gh/news/a1',
  } as Article;
};
