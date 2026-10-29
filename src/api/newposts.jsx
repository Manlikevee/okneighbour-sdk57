
import { saveApiError } from '@/components/errorLogger';
import { api } from './client';

function getFileName(file, index) {
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

function getMimeType(file, fileName) {
  if (file.mimeType || file.type) {
    return file.mimeType || file.type;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return mimeTypes[extension] || 'image/jpeg';
}

export async function createNewPost(input) {
  const {
    content = '',
    location = '',
    images = [],
  } = input || {};

  if (!location.trim()) {
    throw new Error('Please select a location before posting.');
  }

  if (!content.trim() && images.length === 0) {
    throw new Error('Write something or add a photo before posting.');
  }

  const form = new FormData();

  form.append('content', content);
  form.append('location', location);

  images.forEach((image, index) => {
    if (!image?.uri) {
      throw new Error(`Photo ${index + 1} has no valid file URI.`);
    }

    const name = getFileName(image, index);
    const type = getMimeType(image, name);

    form.append('image', {
      uri: image.uri,
      name,
      type,
    });
  });

  try {
    console.log('[createNewPost] Starting upload', {
      endpoint: '/postings/create-v2/',
      imageCount: images.length,
      imageFiles: images.map((image, index) => {
        const name = getFileName(image, index);

        return {
          name,
          type: getMimeType(image, name),
        };
      }),
    });

    const response = await api.post(
      '/postings/create-v2/',
      form,
      {
        timeout: 180000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('[createNewPost] Success:', response.status);

    return response.data;
  } catch (error) {
    try {
      await saveApiError('createNewPost failed', error);
    } catch (loggingError) {
      console.warn('[createNewPost] Error logging failed:', loggingError);
    }

    console.error('[createNewPost] Upload failed', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      response: error?.response?.data,
    });

    if (
      error?.code === 'ECONNABORTED' ||
      error?.code === 'ETIMEDOUT'
    ) {
      throw new Error(
        'The upload timed out. Please check your connection and try again.',
      );
    }

    if (error?.response) {
      const data = error.response.data;

      const message =
        data?.detail ||
        data?.message ||
        data?.error ||
        data?.image?.[0] ||
        data?.content?.[0] ||
        data?.location?.[0];

      throw new Error(
        message ||
          `Post creation failed with HTTP ${error.response.status}. Check api-error.log for details.`,
      );
    }

    throw new Error(
      error?.message ||
        'Unable to upload your post. Check your internet connection and try again.',
    );
  }
}

export default createNewPost;
