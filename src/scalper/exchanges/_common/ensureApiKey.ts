import type { JSONSync } from '../../../config';
import { ScalperError } from '../../../_common/error';

const EnsureApiKeyRefusal = {
  MISSING_API_KEY: 'MISSING_API_KEY',
  MISSING_API_SECRET: 'MISSING_API_SECRET',
};

export const ensureApiKey = (config: JSONSync) => {
  const apiKey = config.getData().apiKey;
  const apiSecret = config.getData().apiSecret;

  if (!apiKey) {
    throw new ScalperError(EnsureApiKeyRefusal.MISSING_API_KEY);
  }

  if (!apiSecret) {
    throw new ScalperError(EnsureApiKeyRefusal.MISSING_API_SECRET);
  }

  return {
    apiKey,
    apiSecret,
  };
};
