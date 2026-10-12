import express from "express";
import {
  logIn,
  requireAuth,
  revokeSession,
  signUp,
} from "../auth.js";
import { asyncRoute, getAuthenticatedUser } from "./helpers.js";

export const authRoutes = express.Router();

authRoutes.post(
  "/signup",
  asyncRoute(async (request, response) => {
    const session = await signUp(
      request.body?.name,
      request.body?.email,
      request.body?.password,
      request.body?.role,
    );
    response.status(201).json(session);
  }),
);

authRoutes.post(
  "/login",
  asyncRoute(async (request, response) => {
    const session = await logIn(request.body?.email, request.body?.password);
    response.json(session);
  }),
);

authRoutes.get("/me", requireAuth, (request, response) => {
  response.json(getAuthenticatedUser(request.authUser));
});

authRoutes.post(
  "/logout",
  requireAuth,
  asyncRoute(async (request, response) => {
    await revokeSession(request);
    response.sendStatus(204);
  }),
);
