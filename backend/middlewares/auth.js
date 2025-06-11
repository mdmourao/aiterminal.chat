import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const authMiddleware = () => {
  return async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user;
    next();
  };
};
