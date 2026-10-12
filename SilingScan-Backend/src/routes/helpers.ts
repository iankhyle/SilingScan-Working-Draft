import express from "express";
import { ApiError } from "../auth.js";
import type { PublicUser } from "../types.js";

export const getAuthenticatedUser = (
  user: PublicUser | undefined,
): PublicUser => {
  if (!user) {
    throw new ApiError(401, "Please log in to continue.");
  }
  return user;
};

export const asyncRoute =
  (
    handler: (
      request: express.Request,
      response: express.Response,
    ) => Promise<void>,
  ): express.RequestHandler =>
  (request, response, next) => {
    void handler(request, response).catch(next);
  };
