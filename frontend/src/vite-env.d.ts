/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MONDAY_API_TOKEN: string
    readonly VITE_GROQ_API_KEY: string
    readonly VITE_MODEL_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
