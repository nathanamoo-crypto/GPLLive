import { Article, NewsItem } from '../types';
import { DUMMY_NEWS } from '../constants/homeDummyData';

export const getLatestNews = async (): Promise<NewsItem[]> => {
  return DUMMY_NEWS;
};

export const getArticleDetails = async (id: string): Promise<Article | null> => {
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
