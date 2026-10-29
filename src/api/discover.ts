import { api } from './client';
import type { Article, Business, EventItem } from './types';

export async function getBusinesses(): Promise<Business[]> {
  const res = await api.get<Business[]>('dashboard/business/all/');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getEvents(keyword: string): Promise<EventItem[]> {
  const res = await api.get<EventItem[]>('dashboard/eventskeyword/', { params: { keyword } });
  return Array.isArray(res.data) ? res.data : [];
}

export async function getNews(keyword: string): Promise<Article[]> {
  const res = await api.get<{ data?: { articles?: Article[] } }>(`dashboard/news/${encodeURIComponent(keyword)}/`);
  const articles = res.data?.data?.articles;
  return Array.isArray(articles) ? articles.filter((a) => a.title && a.title !== '[Removed]') : [];
}
