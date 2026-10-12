import { randomUUID } from "node:crypto";
import express from "express";
import { and, desc, eq } from "drizzle-orm";
import { ApiError, requireAuth } from "../auth.js";
import { db } from "../db/index.js";
import { crops } from "../db/schema/crops.js";
import { asyncRoute, getAuthenticatedUser } from "./helpers.js";

export const cropRoutes = express.Router();

cropRoutes.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const user = getAuthenticatedUser(request.authUser);
    if (user.role !== "farmer") {
      throw new ApiError(403, "Crop records are currently available to farmers.");
    }
    response.json(
      await db
        .select()
        .from(crops)
        .where(eq(crops.userId, user.id))
        .orderBy(desc(crops.createdAt)),
    );
  }),
);

cropRoutes.post(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const user = getAuthenticatedUser(request.authUser);
    if (user.role !== "farmer") {
      throw new ApiError(403, "Only farmers can add crop records.");
    }
    const { name, variety, location, plantedAt, notes } = request.body ?? {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof variety !== "string" ||
      !variety.trim() ||
      variety.trim().length > 100 ||
      typeof location !== "string" ||
      !location.trim() ||
      location.trim().length > 160 ||
      (notes !== undefined && typeof notes !== "string") ||
      (typeof notes === "string" && notes.length > 2000)
    ) {
      throw new ApiError(
        400,
        "Provide a crop name, variety, location, and notes under the stated length limits.",
      );
    }
    const plantedAtDate =
      typeof plantedAt === "string" && plantedAt
        ? new Date(`${plantedAt}T00:00:00.000Z`)
        : null;
    if (plantedAtDate && Number.isNaN(plantedAtDate.getTime())) {
      throw new ApiError(400, "Planting date is invalid.");
    }
    const [record] = await db
      .insert(crops)
      .values({
        id: randomUUID(),
        userId: user.id,
        name: name.trim(),
        variety: variety.trim(),
        location: location.trim(),
        plantedAt: plantedAtDate,
        notes: typeof notes === "string" ? notes.trim() : "",
      })
      .returning();
    response.status(201).json(record);
  }),
);

cropRoutes.delete(
  "/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    const user = getAuthenticatedUser(request.authUser);
    if (user.role !== "farmer") {
      throw new ApiError(403, "Only farmers can remove their crop records.");
    }
    const cropId = request.params.id;
    if (typeof cropId !== "string" || !cropId) {
      throw new ApiError(400, "A crop record ID is required.");
    }
    const [removed] = await db
      .delete(crops)
      .where(and(eq(crops.id, cropId), eq(crops.userId, user.id)))
      .returning({ id: crops.id });
    if (!removed) {
      throw new ApiError(404, "Crop record not found.");
    }
    response.sendStatus(204);
  }),
);
