/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_URL: string;
  readonly VITE_ONESIGNAL_APP_ID?: string;
  readonly VITE_ONESIGNAL_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
