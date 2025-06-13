import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import customLogger from "../utils/logger.js";

export const authMiddleware = () => {
  return async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      customLogger.warn("Unauthorized access attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }
    customLogger.info("User auth: OK");
    req.user = session.user;
    next();
  };
};
