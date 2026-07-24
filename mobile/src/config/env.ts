import Config from 'react-native-config';

const DEFAULT_API_URL = 'http://localhost:3000';

function readHttpUrl(value: string | undefined): string {
  const candidate = value?.trim() || DEFAULT_API_URL;
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(candidate)) {
    throw new Error('API_BASE_URL deve ser uma URL HTTP(S) valida.');
  }
  return candidate.replace(/\/$/, '');
}

export const API_BASE_URL = readHttpUrl(Config.API_BASE_URL);
export const API_TIMEOUT_MS = 10_000;
