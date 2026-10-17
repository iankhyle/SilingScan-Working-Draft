const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    "Set VITE_API_URL to the deployed SilingScan API URL before building for production.",
  );
}

export const API_URL = configuredApiUrl || "http://localhost:8000/api";
