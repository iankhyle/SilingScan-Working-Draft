import { randomUUID } from "node:crypto";
import express from "express";
import multer from "multer";
import { desc, eq } from "drizzle-orm";
import {
  requireAuth,
  requireUploadRole,
  ApiError,
} from "../auth.js";
import { db } from "../db/index.js";
import { scans } from "../db/schema/scans.js";
import { analyzePepperImage } from "../model.js";
import type { ScanHistoryEntry } from "../types.js";
import { asyncRoute, getAuthenticatedUser } from "./helpers.js";

const maximumImageSize = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maximumImageSize, files: 1 },
});

const imageMimeType = (image: Buffer): string | undefined => {
  if (
    image.length >= 8 &&
    image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "image/png";
  }
  if (
    image.length >= 3 &&
    image[0] === 0xff &&
    image[1] === 0xd8 &&
    image[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    image.length >= 12 &&
    image.toString("ascii", 0, 4) === "RIFF" &&
    image.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return undefined;
};

const toScanHistoryEntry = (
  scan: typeof scans.$inferSelect,
): ScanHistoryEntry => ({
  id: scan.id,
  imageUrl: scan.imageData,
  status: scan.status as ScanHistoryEntry["status"],
  confidence: scan.confidence,
  summary: scan.summary,
  urgency: scan.urgency,
  recommendations: scan.recommendations,
  createdAt: scan.createdAt.toISOString(),
});

export const scanRoutes = express.Router();

scanRoutes.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const user = getAuthenticatedUser(request.authUser);
    const conditions =
      user.role === "farmer" ? eq(scans.userId, user.id) : undefined;
    const records = await db
      .select()
      .from(scans)
      .where(conditions)
      .orderBy(desc(scans.createdAt));
    response.json(records.map(toScanHistoryEntry));
  }),
);

scanRoutes.post(
  "/analyze",
  requireAuth,
  requireUploadRole,
  upload.single("image"),
  asyncRoute(async (request, response) => {
    const image = request.file;
    if (!image) {
      throw new ApiError(400, "Choose an image file to scan.");
    }
    const mimeType = imageMimeType(image.buffer);
    if (!mimeType) {
      throw new ApiError(400, "Upload a valid JPG, PNG, or WEBP image.");
    }

    const result = await analyzePepperImage(image.buffer);
    const user = getAuthenticatedUser(request.authUser);
    const id = randomUUID();
    const createdAt = new Date();
    const imageData = `data:${mimeType};base64,${image.buffer.toString("base64")}`;

    const [scan] = await db
      .insert(scans)
      .values({
        id,
        userId: user.id,
        imageData,
        ...result,
        createdAt,
      })
      .returning();
    if (!scan) {
      throw new Error("Database did not return the saved scan.");
    }

    response.status(201).json(toScanHistoryEntry(scan));
  }),
);
