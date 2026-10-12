import { randomUUID } from "node:crypto";
import express from "express";
import { desc } from "drizzle-orm";
import { ApiError, requireAuth, requireStaffRole } from "../auth.js";
import { db } from "../db/index.js";
import { advisories } from "../db/schema/advisories.js";
import { asyncRoute, getAuthenticatedUser } from "./helpers.js";

export const advisoryRoutes = express.Router();

advisoryRoutes.get(
  "/",
  requireAuth,
  asyncRoute(async (_request, response) => {
    response.json(
      await db.select().from(advisories).orderBy(desc(advisories.createdAt)),
    );
  }),
);

advisoryRoutes.post(
  "/",
  requireAuth,
  requireStaffRole,
  asyncRoute(async (request, response) => {
    const user = getAuthenticatedUser(request.authUser);
    const { title, category, crop, body } = request.body ?? {};
    const categories = ["Pest", "Disease", "Growing", "Weather"];
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 140 ||
      typeof category !== "string" ||
      !categories.includes(category) ||
      typeof crop !== "string" ||
      !crop.trim() ||
      crop.trim().length > 80 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.trim().length > 5000
    ) {
      throw new ApiError(400, "Enter a valid title, category, crop, and advisory.");
    }
    const [advisory] = await db
      .insert(advisories)
      .values({
        id: randomUUID(),
        title: title.trim(),
        category,
        crop: crop.trim(),
        body: body.trim(),
        authorId: user.id,
      })
      .returning();
    response.status(201).json(advisory);
  }),
);
