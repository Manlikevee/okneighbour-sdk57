import { api } from './client';
import type { Comment, LocalFile, Post } from './types';

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as T[]) : [];
}

/** Without a location the backend returns posts from everywhere. */
export async function getPosts(location?: string | null): Promise<Post[]> {
  const res = await api.get<unknown>('postings/', { params: location ? { location } : undefined });
  return asArray<Post>(res.data);
}

export async function getPost(ref: string): Promise<Post> {
  const res = await api.get<Post>(`postings/get/${encodeURIComponent(ref)}/`);
  return res.data;
}

export async function createPost(input: { content: string; location: string; images: LocalFile[] }): Promise<Post> {
  const form = new FormData();
  form.append('content', input.content);
  form.append('location', input.location);
  for (const img of input.images) form.append('image', img as unknown as Blob);
  const res = await api.post<Post>('postings/create/', form, {
    // Required: the instance would otherwise serialise FormData as JSON.
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  });
  return res.data;
}

export async function addComment(ref: string, content: string): Promise<Comment> {
  const res = await api.post<Comment>('postings/comments/create/', { ref, content });
  return res.data;
}
