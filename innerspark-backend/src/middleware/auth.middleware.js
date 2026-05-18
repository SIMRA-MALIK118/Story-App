import { supabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/ApiResponse.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) throw new ApiError(401, "Invalid or expired token");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    req.user = { ...user, profile };
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  try {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) req.user = user;
  } catch (_) {}
  next();
};
