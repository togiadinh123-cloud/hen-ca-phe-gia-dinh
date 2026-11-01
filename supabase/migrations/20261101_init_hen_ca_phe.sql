-- ==============================================================================
-- MIGRATION: 20261101_init_hen_ca_phe.sql
-- DESCRIPTION: Core schema, tables, foreign keys, constraints, functions and RLS
-- for "HẸN CÀ PHÊ" private friend group coffee meetup web app.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city TEXT DEFAULT 'Hồ Chí Minh',
  district TEXT,
  coffee_preferences TEXT[] DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  show_in_leaderboard BOOLEAN DEFAULT TRUE,
  show_badges BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 2. FRIEND GROUPS (Private by design)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.friend_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility = 'private'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 3. GROUP MEMBERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'left', 'removed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  left_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  CONSTRAINT uq_group_user UNIQUE (group_id, user_id)
);

-- ==========================================
-- 4. GROUP INVITATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  invite_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INT NOT NULL DEFAULT 10,
  use_count INT NOT NULL DEFAULT 0,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 5. GROUP MEMBER STATS (Gamification per Group)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.group_member_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reputation_score INT NOT NULL DEFAULT 100 CHECK (reputation_score >= 0),
  xp_total INT NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak_count INT NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
  last_qualified_event_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_group_member_stat UNIQUE (group_id, user_id)
);

-- ==========================================
-- 6. EVENTS (Kèo Cà Phê)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL DEFAULT 'Hồ Chí Minh',
  district TEXT,
  area_label TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  capacity INT NOT NULL CHECK (capacity >= 2 AND capacity <= 50),
  budget_min INT,
  budget_max INT,
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  event_status TEXT NOT NULL DEFAULT 'published' CHECK (event_status IN ('draft', 'published', 'canceled', 'completed')),
  registration_status TEXT NOT NULL DEFAULT 'open' CHECK (registration_status IN ('open', 'full', 'closed')),
  poll_closes_at TIMESTAMPTZ NOT NULL,
  cancellation_deadline TIMESTAMPTZ NOT NULL,
  venue_poll_status TEXT NOT NULL DEFAULT 'open' CHECK (venue_poll_status IN ('open', 'closed', 'locked')),
  selected_place_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 7. EVENT PARTICIPANTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
  participant_status TEXT NOT NULL DEFAULT 'registered' CHECK (
    participant_status IN ('registered', 'traveling', 'checked_in', 'cancelled', 'no_show_pending', 'no_show_confirmed', 'removed')
  ),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  cancelled_at TIMESTAMPTZ,
  checkin_id UUID,
  location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_location_at TIMESTAMPTZ,
  CONSTRAINT uq_event_participant UNIQUE (event_id, user_id)
);

-- ==========================================
-- 8. EVENT PLACES (Google Places Propose)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.event_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  google_place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  google_maps_uri TEXT,
  photo_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_event_google_place UNIQUE (event_id, google_place_id)
);

-- Foreign key back to selected place on events
ALTER TABLE public.events 
  DROP CONSTRAINT IF EXISTS fk_events_selected_place,
  ADD CONSTRAINT fk_events_selected_place 
  FOREIGN KEY (selected_place_id) 
  REFERENCES public.event_places(id) 
  ON DELETE SET NULL;

-- ==========================================
-- 9. EVENT VOTES (One active vote per participant)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.event_places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_event_user_vote UNIQUE (event_id, user_id)
);

-- ==========================================
-- 10. LIVE LOCATIONS (Strictly private)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_m DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uq_event_user_location UNIQUE (event_id, user_id)
);

-- ==========================================
-- 11. CHECKIN SESSIONS (Host QR with Nonce)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.checkin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  nonce TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  host_latitude DOUBLE PRECISION,
  host_longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

-- ==========================================
-- 12. CHECKINS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  checkin_session_id UUID REFERENCES public.checkin_sessions(id) ON DELETE SET NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('gps_qr', 'manual_review', 'admin_override')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  distance_to_venue_m DOUBLE PRECISION,
  gps_accuracy_m DOUBLE PRECISION,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_review', 'rejected')),
  CONSTRAINT uq_event_user_checkin UNIQUE (event_id, user_id)
);

-- Link checkin_id back to event_participants
ALTER TABLE public.event_participants 
  DROP CONSTRAINT IF EXISTS fk_participants_checkin,
  ADD CONSTRAINT fk_participants_checkin 
  FOREIGN KEY (checkin_id) 
  REFERENCES public.checkins(id) 
  ON DELETE SET NULL;

-- ==========================================
-- 13. REPUTATION TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reputation_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  delta INT NOT NULL,
  reason_code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'system',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 14. XP TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  delta INT NOT NULL CHECK (delta >= 0),
  reason_code TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 15. BADGES & USER BADGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  source_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  CONSTRAINT uq_group_user_badge UNIQUE (group_id, user_id, badge_id)
);

-- ==========================================
-- 16. APPEALS (Khiếu nại điểm / no-show)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- 17. REPORTS & NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id),
  target_event_id UUID REFERENCES public.events(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE GROUP-ISOLATED QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id, membership_status);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id, membership_status);
CREATE INDEX IF NOT EXISTS idx_events_group ON public.events(group_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(event_status, starts_at);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id, participant_status);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_live_locations_event ON public.live_locations(event_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_reputation_group_user ON public.reputation_transactions(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_xp_group_user ON public.xp_transactions(group_id, user_id);

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS (SECURITY DEFINER)
-- ==============================================================================

-- Check if a user is an active member of a group
CREATE OR REPLACE FUNCTION public.is_active_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND membership_status = 'active'
  );
$$;

-- Check if a user is a confirmed participant of an event
CREATE OR REPLACE FUNCTION public.is_event_participant(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_participants
    WHERE event_id = p_event_id
      AND user_id = p_user_id
      AND participant_status NOT IN ('cancelled', 'removed')
  );
$$;

-- Check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id
      AND role = 'admin'
  );
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: No public listing, no cross-group leak, no anon reading.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_member_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY profiles_select_self_or_fellow_members ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_platform_admin(auth.uid())
    OR EXISTS (
      -- Only users who share at least one active group together can view profile
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = profiles.id
        AND gm1.membership_status = 'active'
        AND gm2.membership_status = 'active'
    )
  );

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 2. FRIEND GROUPS
CREATE POLICY friend_groups_select ON public.friend_groups
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY friend_groups_insert ON public.friend_groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY friend_groups_update ON public.friend_groups
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = friend_groups.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND membership_status = 'active'
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 3. GROUP MEMBERS
CREATE POLICY group_members_select ON public.group_members
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY group_members_insert ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
        AND gm.membership_status = 'active'
    )
  );

CREATE POLICY group_members_update ON public.group_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
        AND gm.membership_status = 'active'
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 4. GROUP INVITATIONS
CREATE POLICY invitations_select ON public.group_invitations
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY invitations_insert ON public.group_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_active_group_member(group_id, auth.uid())
  );

-- 5. GROUP MEMBER STATS
CREATE POLICY stats_select ON public.group_member_stats
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

-- 6. EVENTS
CREATE POLICY events_select ON public.events
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY events_insert ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_active_group_member(group_id, auth.uid())
    AND host_id = auth.uid()
  );

CREATE POLICY events_update ON public.events
  FOR UPDATE TO authenticated
  USING (
    host_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = events.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
        AND gm.membership_status = 'active'
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 7. EVENT PARTICIPANTS
CREATE POLICY participants_select ON public.event_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_participants.event_id
        AND public.is_active_group_member(e.group_id, auth.uid())
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY participants_insert ON public.event_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_participants.event_id
        AND public.is_active_group_member(e.group_id, auth.uid())
        AND e.event_status = 'published'
        AND e.registration_status = 'open'
    )
  );

CREATE POLICY participants_update ON public.event_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_participants.event_id
        AND e.host_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 8. EVENT PLACES
CREATE POLICY event_places_select ON public.event_places
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_places.event_id
        AND public.is_active_group_member(e.group_id, auth.uid())
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY event_places_insert ON public.event_places
  FOR INSERT TO authenticated
  WITH CHECK (
    proposed_by = auth.uid()
    AND public.is_event_participant(event_id, auth.uid())
  );

-- 9. EVENT VOTES
CREATE POLICY event_votes_select ON public.event_votes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_votes.event_id
        AND public.is_active_group_member(e.group_id, auth.uid())
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY event_votes_insert ON public.event_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_event_participant(event_id, auth.uid())
  );

CREATE POLICY event_votes_update ON public.event_votes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY event_votes_delete ON public.event_votes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 10. LIVE LOCATIONS (MAXIMUM PRIVACY: only RSVP'd participants in the same event)
CREATE POLICY live_locations_select ON public.live_locations
  FOR SELECT TO authenticated
  USING (
    public.is_event_participant(event_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY live_locations_upsert ON public.live_locations
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND public.is_event_participant(event_id, auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_event_participant(event_id, auth.uid())
  );

-- 11. CHECKIN SESSIONS
CREATE POLICY checkin_sessions_select ON public.checkin_sessions
  FOR SELECT TO authenticated
  USING (
    public.is_event_participant(event_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY checkin_sessions_insert ON public.checkin_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    host_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = checkin_sessions.event_id
        AND e.host_id = auth.uid()
    )
  );

-- 12. CHECKINS
CREATE POLICY checkins_select ON public.checkins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = checkins.event_id
        AND public.is_active_group_member(e.group_id, auth.uid())
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 13. REPUTATION & XP TRANSACTIONS (Append-only audit, only system/admin insert)
CREATE POLICY rep_trans_select ON public.reputation_transactions
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY xp_trans_select ON public.xp_transactions
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

-- 14. BADGES
CREATE POLICY badges_select_all ON public.badges
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY user_badges_select ON public.user_badges
  FOR SELECT TO authenticated
  USING (
    public.is_active_group_member(group_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

-- 15. APPEALS & NOTIFICATIONS
CREATE POLICY appeals_select ON public.appeals
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = appeals.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
        AND gm.membership_status = 'active'
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY appeals_insert ON public.appeals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 16. ADMIN AUDIT LOGS
CREATE POLICY audit_logs_admin_only ON public.admin_audit_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
