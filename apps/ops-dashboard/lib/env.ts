const REQUIRED_ENV_VARS = {
  development: 'API_BASE_URL_DEV',
  staging: 'API_BASE_URL_STAGING',
  production: 'API_BASE_URL_PROD',
} as const

type SupportedEnv = keyof typeof REQUIRED_ENV_VARS

function isSupportedEnv(env: string | undefined): env is SupportedEnv {
  return env === 'development' || env === 'staging' || env === 'production'
}

export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_ENV

  if (!isSupportedEnv(env)) {
    throw new Error('Invalid environment')
  }

  const envVarName = REQUIRED_ENV_VARS[env]
  const baseUrl = process.env[envVarName]

  if (!baseUrl) {
    throw new Error(`Missing environment variable: ${envVarName}`)
  }

  return baseUrl
}
