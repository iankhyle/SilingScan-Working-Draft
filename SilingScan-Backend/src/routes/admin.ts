import express from "express";
import { and, desc, eq, ne } from "drizzle-orm";
import { ApiError, requireAdminRole, requireAuth } from "../auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/auth.js";
import { scans } from "../db/schema/scans.js";
import { asyncRoute } from "./helpers.js";

export const adminRoutes = express.Router();

adminRoutes.get(
  "/scans",
  requireAuth,
  requireAdminRole,
  asyncRoute(async (_request, response) => {
    const records = await db
      .select({
        id: scans.id,
        userId: scans.userId,
        userName: users.name,
        userEmail: users.email,
        imageUrl: scans.imageData,
        status: scans.status,
        confidence: scans.confidence,
        summary: scans.summary,
        urgency: scans.urgency,
        recommendations: scans.recommendations,
        createdAt: scans.createdAt,
      })
      .from(scans)
      .innerJoin(users, eq(scans.userId, users.id))
      .orderBy(desc(scans.createdAt));

    response.json(
      records.map((scan) => ({
        ...scan,
        status: scan.status as "Healthy" | "Diseased" | "Pending",
        createdAt: scan.createdAt.toISOString(),
      })),
    );
  }),
);

adminRoutes.get(
  "/users",
  requireAuth,
  requireAdminRole,
  asyncRoute(async (_request, response) => {
    const accounts = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    response.json(accounts);
  }),
);

adminRoutes.patch(
  "/users/:id/role",
  requireAuth,
  requireAdminRole,
  asyncRoute(async (request, response) => {
    const { role } = request.body ?? {};
    if (
      typeof role !== "string" ||
      !["farmer", "researcher", "agriculturist"].includes(role)
    ) {
      throw new ApiError(400, "Choose a valid non-admin role.");
    }
    const userId = request.params.id;
    if (typeof userId !== "string" || !userId) {
      throw new ApiError(400, "A user ID is required.");
    }
    const [updated] = await db
      .update(users)
      .set({ role: role as "farmer" | "researcher" | "agriculturist" })
      .where(and(eq(users.id, userId), ne(users.role, "admin")))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    if (!updated) {
      throw new ApiError(404, "Only existing non-admin accounts can be updated.");
    }
    response.json(updated);
  }),
);
