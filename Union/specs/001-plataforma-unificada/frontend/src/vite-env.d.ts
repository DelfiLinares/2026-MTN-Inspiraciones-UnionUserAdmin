/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_GOOGLE_REDIRECT_URL: string
  readonly VITE_AUTH_GITHUB_REDIRECT_URL: string
  readonly VITE_GEOLOCATION_ENABLED_DEFAULT: string
  readonly VITE_SESSION_EXPIRY_REDIRECT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
