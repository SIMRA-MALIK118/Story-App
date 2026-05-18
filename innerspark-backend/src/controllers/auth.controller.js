import { supabase, supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, username } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");

  // Debug — remove after fix
  console.log("[Register] URL:", process.env.SUPABASE_URL || "❌ MISSING");
  console.log("[Register] KEY:", process.env.SUPABASE_ANON_KEY ? "✅ " + process.env.SUPABASE_ANON_KEY.slice(0,30) + "..." : "❌ MISSING");

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

  if (error) {
    console.error("[Register Supabase Error]:", error);
    throw new ApiError(400, error.message);
  }
  if (!data.user) throw new ApiError(400, "Signup failed — please try again");

  const handle = (username || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);

  try {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
      username: handle,
      email,
      created_at: new Date().toISOString(),
    });
  } catch (profileErr) {
    console.warn("[Register] Profile upsert failed:", profileErr.message);
  }

  if (data.session) {
    return res.status(201).json(new ApiResponse(201, { user: data.user, session: data.session }, "Account created"));
  }

  res.status(201).json(new ApiResponse(201, { user: data.user, session: null, requiresConfirmation: true }, "Check your email to confirm your account"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password required");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(401, "Invalid credentials");

  const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", data.user.id).single();

  res.json(new ApiResponse(200, { user: data.user, profile, session: data.session }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  res.json(new ApiResponse(200, null, "Logged out"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user.id).single();
  res.json(new ApiResponse(200, { user: req.user, profile }));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) throw new ApiError(400, "Refresh token required");

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) throw new ApiError(401, "Invalid refresh token");

  res.json(new ApiResponse(200, { session: data.session }));
});
