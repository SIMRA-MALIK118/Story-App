// dotenv must load BEFORE any other module reads process.env
import { config } from "dotenv";
config();

// Dynamic import guarantees env vars are set before app.js runs
const { default: app } = await import("./src/app.js");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🚀 InnerSpark API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Supabase URL: ${process.env.SUPABASE_URL ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_ANON_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🤖 Groq Key: ${process.env.GROQ_API_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
