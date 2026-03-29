/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_REDIRECT_URI: string | undefined
  readonly VITE_BASE_PATH: string | undefined
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
