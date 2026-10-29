import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE = `${FileSystem.documentDirectory}api-error.log`;

export async function saveApiError(
  title: string,
  error: unknown,
): Promise<void> {
  try {
    const err = error as {
      message?: string;
      code?: string;
      stack?: string;
      config?: {
        url?: string;
        method?: string;
      };
      response?: {
        status?: number;
        data?: unknown;
      };
    };

    const responseData = err.response?.data;

    const details = [
      `=== ${title} ===`,
      `Time: ${new Date().toISOString()}`,
      `Message: ${err.message ?? 'Unknown error'}`,
      `Code: ${err.code ?? 'N/A'}`,
      `URL: ${err.config?.url ?? 'N/A'}`,
      `Method: ${err.config?.method ?? 'N/A'}`,
      `HTTP Status: ${err.response?.status ?? 'N/A'}`,
      '',
      '=== SERVER RESPONSE ===',
      typeof responseData === 'string'
        ? responseData
        : JSON.stringify(responseData, null, 2) ??
          'No response data',
      '',
      '=== STACK TRACE ===',
      err.stack ?? 'No stack trace available',
      '\n\n',
    ].join('\n');

    if (!FileSystem.documentDirectory) {
      console.warn('Cannot save API log: document directory unavailable.');
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);

    if (fileInfo.exists) {
      await FileSystem.writeAsStringAsync(
        LOG_FILE,
        `${await FileSystem.readAsStringAsync(LOG_FILE)}\n${details}`,
      );
    } else {
      await FileSystem.writeAsStringAsync(LOG_FILE, details);
    }

    console.log('[API ERROR] Full error saved to:', LOG_FILE);
  } catch (loggingError) {
    // A logging failure must never replace the original API error.
    console.warn(
      '[API ERROR] Could not save diagnostic log:',
      loggingError,
    );
  }
}