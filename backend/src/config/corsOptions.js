import "dotenv/config";

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const allowedOrigins = new Set(
  [...configuredOrigins, ...localOrigins].filter(Boolean)
);

const netlifySitePattern =
  /^https:\/\/([a-z0-9]+--)?jovial-blini-1de08d\.netlify\.app$/i;

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.has(origin) || netlifySitePattern.test(origin);
};

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};
