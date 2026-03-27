import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getHostFromExpo() {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.linkingUri,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  for (const candidate of hostCandidates) {
    const withoutProtocol = candidate.replace(/^[a-z]+:\/\//i, '');
    const host = withoutProtocol.split('/')[0]?.split(':')[0];
    if (host) {
      return host;
    }
  }

  return 'localhost';
}

function getHostFromConfiguredApiUrl() {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!configuredApiUrl) {
    return null;
  }

  try {
    return new URL(configuredApiUrl).hostname;
  } catch {
    return null;
  }
}

function shouldUseConfiguredHost(host: string) {
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return true;
  }

  return Platform.OS === 'web' || Platform.OS === 'ios';
}

export function getServiceBaseUrl(port: number) {
  const configuredHost = getHostFromConfiguredApiUrl();
  const host =
    configuredHost && shouldUseConfiguredHost(configuredHost)
      ? configuredHost
      : getHostFromExpo();

  return `http://${host}:${port}`;
}

export async function requestJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore non-JSON error payloads and keep the generic message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}
