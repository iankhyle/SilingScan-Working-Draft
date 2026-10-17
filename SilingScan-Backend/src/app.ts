import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import multer from "multer";
import { ApiError } from "./auth.js";
import { adminRoutes } from "./routes/admin.js";
import { advisoryRoutes } from "./routes/advisories.js";
import { authRoutes } from "./routes/auth.js";
import { cropRoutes } from "./routes/crops.js";
import { scanRoutes } from "./routes/scans.js";

export const createApp = () => {
  const app = express();
  const configuredOrigins = new Set(
    (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  app.use((request, response, next) => {
    const origin = request.header("origin");
    if (
      origin &&
      (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        configuredOrigins.has(origin))
    ) {
      response.header("Access-Control-Allow-Origin", origin);
      response.header("Vary", "Origin");
    }
    response.header(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    response.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/scans", scanRoutes);
  app.use("/api/crops", cropRoutes);
  app.use("/api/advisories", advisoryRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((_request, response) => {
    response.status(404).json({ message: "Endpoint not found." });
  });

  const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
  ) => {
    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      response.status(status).json({
        message:
          status === 413
            ? "Image must be 5 MB or smaller."
            : "Upload one image file using the image field.",
      });
      return;
    }

    if (error instanceof ApiError) {
      response.status(error.status).json({ message: error.message });
      return;
    }

    console.error("Unhandled backend error:", error);
    response
      .status(500)
      .json({ message: "An unexpected server error occurred." });
  };
  app.use(errorHandler);

  return app;
};
