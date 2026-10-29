
import { saveApiError } from '@/components/errorLogger';
import { api } from './client';
import type { Comment, LocalFile, Post } from './types';

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as T[]) : [];
}

/** Without a location, the backend returns posts from everywhere. */
export async function getPosts(
  location?: string | null,
): Promise<Post[]> {
  const res = await api.get<unknown>('postings/', {
    params: location ? { location } : undefined,
  });

  return asArray<Post>(res.data);
}

export async function getPost(ref: string): Promise<Post> {
  const res = await api.get<Post>(
    `postings/get/${encodeURIComponent(ref)}/`,
  );

  return res.data;
}

type UploadableLocalFile = LocalFile & {
  name?: string;
  fileName?: string | null;
  mimeType?: string | null;
  type?: string;
};

function getFileName(file: UploadableLocalFile, index: number): string {
  const suppliedName = file.name || file.fileName;

  if (suppliedName) {
    return suppliedName;
  }

  const uriWithoutQuery = file.uri.split('?')[0];
  const lastSegment = uriWithoutQuery.split('/').pop();

  if (lastSegment && /\.[a-z0-9]+$/i.test(lastSegment)) {
    return lastSegment;
  }

  return `post-image-${index + 1}.jpg`;
}

function getMimeType(
  file: UploadableLocalFile,
  fileName: string,
): string {
  if (file.mimeType || file.type) {
    return file.mimeType || file.type!;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return mimeTypes[extension ?? ''] ?? 'image/jpeg';
}

export async function createPost(input: {
  content: string;
  location: string;
  images: LocalFile[];
}): Promise<Post> {
  if (!input.location.trim()) {
    throw new Error('Please select a location before posting.');
  }

  if (!input.content.trim() && input.images.length === 0) {
    throw new Error('Write something or add a photo before posting.');
  }

  const form = new FormData();

  form.append('content', input.content);
  form.append('location', input.location);

  input.images.forEach((image, index) => {
    const file = image as UploadableLocalFile;

    if (!file.uri) {
      throw new Error(`Photo ${index + 1} has no valid file URI.`);
    }

    const name = getFileName(file, index);
    const type = getMimeType(file, name);

    // React Native / Expo FormData file descriptor.
    // The cast satisfies TypeScript; it does not convert the file.
    form.append(
      'image',
      {
        uri: file.uri,
        name,
        type,
      } as unknown as Blob,
    );
  });

  try {
    console.log('[createPost] Starting upload', {
      location: input.location,
      imageCount: input.images.length,
      contentLength: input.content.length,
      imageFiles: input.images.map((image, index) => {
        const file = image as UploadableLocalFile;
        const name = getFileName(file, index);

        return {
          name,
          type: getMimeType(file, name),
          uri: file.uri,
        };
      }),
    });

    const response = await api.post<Post>(
      'postings/create/',
      form,
      {
        timeout: 180000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[createPost] Server response:', response.status);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Post upload failed with HTTP ${response.status}.`);
    }

    console.log('[createPost] Post created successfully');

    return response.data;
  } catch (error: unknown) {
      await saveApiError('Create post with image failed', error);
    const err = error as {
      message?: string;
      code?: string;
      response?: {
        status?: number;
        data?: unknown;
      };
    };

    console.error('[createPost] Upload failed', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      response: err.response?.data,
    });

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error(
        'The upload timed out. Please check your connection and try again.',
      );
    }

    if (err.response) {
      const data = err.response.data as {
        detail?: string;
        message?: string;
        error?: string;
        image?: string[];
        content?: string[];
        location?: string[];
      } | null;

      const message =
        data?.detail ||
        data?.message ||
        data?.error ||
        data?.image?.[0] ||
        data?.content?.[0] ||
        data?.location?.[0];

      throw new Error(
        message ||
          `The server rejected your post (HTTP ${err.response.status ?? 'unknown'}).`,
      );
    }

    throw new Error(
      err.message ||
        'Unable to upload your post. Check your internet connection and try again.',
    );
  }
}

export async function addComment(
  ref: string,
  content: string,
): Promise<Comment> {
  const res = await api.post<Comment>(
    'postings/comments/create/',
    { ref, content },
  );

  return res.data;
}
