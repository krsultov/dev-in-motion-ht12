import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

function extractHost(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const withoutProtocol = candidate.replace(/^[a-z]+:\/\//i, '');
  const host = withoutProtocol.split('/')[0]?.split(':')[0]?.trim();
  return host || null;
}

function isLocalhost(host: string | null) {
  return host === 'localhost' || host === '127.0.0.1';
}

function getHostFromExpo() {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of hostCandidates) {
    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }

  return null;
}

function getHostFromNativeBundle() {
  const sourceCodeHost = extractHost(NativeModules.SourceCode?.scriptURL);
  if (sourceCodeHost) {
    return sourceCodeHost;
  }

  const serverHost = extractHost(NativeModules.PlatformConstants?.ServerHost);
  if (serverHost) {
    return serverHost;
  }

  return null;
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

function buildHelpfulErrorMessage(message: string, url: string) {
  const normalizedMessage = message.trim();

  if (/Access-Control-Allow-Origin|CORS|preflight/i.test(normalizedMessage)) {
    return `Web requests to ${url} are being blocked by CORS. The frontend reached the API origin, but the backend does not allow browser cross-origin requests yet.`;
  }

  if (/ETIMEDOUT/i.test(normalizedMessage) && /27017/.test(normalizedMessage)) {
    return `The frontend reached the API at ${url}, but that API could not reach MongoDB. The backend is timing out while connecting to port 27017.`;
  }

  if (/Network request failed/i.test(normalizedMessage)) {
    return `The app could not reach ${url}. Check that the backend service is running and reachable from this device/browser.`;
  }

  return normalizedMessage;
}

function resolveHost() {
  const configuredHost = getHostFromConfiguredApiUrl();
  const nativeBundleHost = getHostFromNativeBundle();
  const expoHost = getHostFromExpo();

  if (configuredHost && !isLocalhost(configuredHost)) {
    return {
      host: configuredHost,
      source: 'configured-api-url',
    };
  }

  if (nativeBundleHost && !isLocalhost(nativeBundleHost)) {
    return {
      host: nativeBundleHost,
      source: 'react-native-bundle',
    };
  }

  if (expoHost && !isLocalhost(expoHost)) {
    return {
      host: expoHost,
      source: 'expo-runtime',
    };
  }

  if (Platform.OS === 'android') {
    return {
      host: '10.0.2.2',
      source: 'android-emulator-loopback',
    };
  }

  if (configuredHost) {
    return {
      host: configuredHost,
      source: 'configured-localhost-fallback',
    };
  }

  if (nativeBundleHost) {
    return {
      host: nativeBundleHost,
      source: 'react-native-bundle-localhost-fallback',
    };
  }

  if (expoHost) {
    return {
      host: expoHost,
      source: 'expo-runtime-localhost-fallback',
    };
  }

  return {
    host: 'localhost',
    source: 'hardcoded-localhost-fallback',
  };
}

const SERVICE_ENV_VARS: Record<number, string> = {
  3001: process.env.EXPO_PUBLIC_MEMORY_API_URL ?? '',
  3002: process.env.EXPO_PUBLIC_USERDATA_API_URL ?? '',
  3004: process.env.EXPO_PUBLIC_REMINDERS_API_URL ?? '',
};

export function getServiceBaseUrl(port: number) {
  const envOverride = SERVICE_ENV_VARS[port];
  if (envOverride) {
    return envOverride.replace(/\/+$/, '');
  }

  const { host } = resolveHost();
  return `http://${host}:${port}`;
}

export async function requestJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch (error) {
    const originalMessage = error instanceof Error ? error.message : 'Network request failed';
    const helpfulMessage = buildHelpfulErrorMessage(originalMessage, url);

    throw new Error(helpfulMessage);
  }

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

    throw new Error(buildHelpfulErrorMessage(message, url));
  }

  return (await response.json()) as T;
}
