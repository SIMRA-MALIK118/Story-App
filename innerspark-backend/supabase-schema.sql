-- ============================================================
-- InnerSpark Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  xp            INTEGER DEFAULT 0,
  level         INTEGER DEFAULT 1,
  is_pro        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STORIES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  mood                TEXT NOT NULL DEFAULT 'general',
  category            TEXT NOT NULL DEFAULT 'General',
  background_gradient INTEGER DEFAULT 0,
  cover_image_url     TEXT,
  is_anonymous        BOOLEAN DEFAULT FALSE,
  is_ai_generated     BOOLEAN DEFAULT FALSE,
  is_published        BOOLEAN DEFAULT TRUE,
  views_count         INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REACTIONS (likes) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id, type)
);

-- ─── COMMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FOLLOWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ─── SAVED STORIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_stories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- ─── STREAKS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_activity   DATE DEFAULT CURRENT_DATE
);

-- ─── DAILY MOODS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_moods (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood        TEXT NOT NULL,
  note        TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ─── STORY READS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS story_reads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_user   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type        TEXT NOT NULL, -- like, comment, follow, achievement
  story_id    UUID REFERENCES stories(id) ON DELETE CASCADE,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_moods    ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by backend)
CREATE POLICY "Service role bypass" ON profiles       FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON stories        FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON reactions      FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON comments       FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON follows        FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON saved_stories  FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON streaks        FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON daily_moods    FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON story_reads    FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON notifications  FOR ALL USING (true);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g')),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stories_user_id    ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_category   ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_mood        ON stories(mood);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_story_id ON reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_story_id  ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_follows_following  ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
