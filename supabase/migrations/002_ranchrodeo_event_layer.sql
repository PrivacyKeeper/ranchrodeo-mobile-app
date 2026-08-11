-- 002 — Ranch rodeo event layer
--
-- The only team-scored app in the portfolio. Points scales vary by producer
-- and are configuration, not code: two published presets ship, plus a custom
-- table builder, because ranch rodeo producers each have their own
-- arithmetic and will not change it for an app.

CREATE TABLE IF NOT EXISTS public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barn_name TEXT NOT NULL,
  ranch_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rr_ranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  state TEXT,
  -- Required to enter any WRCA sanctioned ranch rodeo. Card verification at
  -- entry is the gate, not a nice-to-have.
  wrca_team_card TEXT,
  card_valid_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rr_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranch_id UUID NOT NULL REFERENCES public.rr_ranches(id) ON DELETE CASCADE,
  event_name TEXT,
  season INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rr_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.rr_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  is_alternate BOOLEAN NOT NULL DEFAULT false,
  -- Once an original participant is replaced by an alternate, that
  -- participant cannot return to the competition.
  replaced_by UUID REFERENCES public.rr_team_members(id),
  retired_from_competition BOOLEAN NOT NULL DEFAULT false,
  roles JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (team_id, display_name)
);

CREATE TABLE IF NOT EXISTS public.rr_event_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.rr_teams(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN
    ('ranch_bronc','stray_gathering','wild_cow_milking','team_branding',
     'number_sorting','doctoring','team_penning','trailer_loading','wild_horse_race')),
  round INTEGER NOT NULL DEFAULT 1,
  raw_time_ms INTEGER,
  official_time_ms INTEGER,
  score INTEGER,
  penalty_seconds INTEGER NOT NULL DEFAULT 0,
  no_time BOOLEAN NOT NULL DEFAULT false,
  place INTEGER,
  points NUMERIC(6,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rr_points_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID,
  name TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN
    ('descending_from_team_count','fixed_table')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  bonus_all_events INTEGER NOT NULL DEFAULT 10,
  tiebreakers JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_preset BOOLEAN NOT NULL DEFAULT false
);

-- The two published scales, shipped as presets.
INSERT INTO public.rr_points_scales (name, scale_type, config, is_preset)
VALUES
  ('WRCA sanctioned', 'descending_from_team_count',
   '{"start":"team_count"}'::jsonb, true),
  ('Texas Ranch Round-Up', 'fixed_table',
   '{"table":{"1":10,"2":7,"3":5,"4":3,"5":1}}'::jsonb, true)
ON CONFLICT DO NOTHING;

ALTER TABLE public.horses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_ranches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_event_runs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_points_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own horses" ON public.horses;
CREATE POLICY "Users manage own horses" ON public.horses FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Ranches are public" ON public.rr_ranches;
CREATE POLICY "Ranches are public" ON public.rr_ranches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners manage ranches" ON public.rr_ranches;
CREATE POLICY "Owners manage ranches" ON public.rr_ranches FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Teams are public" ON public.rr_teams;
CREATE POLICY "Teams are public" ON public.rr_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ranch owners manage teams" ON public.rr_teams;
CREATE POLICY "Ranch owners manage teams" ON public.rr_teams FOR ALL
  USING (EXISTS (SELECT 1 FROM public.rr_ranches r
                 WHERE r.id = rr_teams.ranch_id AND r.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Rosters are public" ON public.rr_team_members;
CREATE POLICY "Rosters are public" ON public.rr_team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ranch owners manage rosters" ON public.rr_team_members;
CREATE POLICY "Ranch owners manage rosters" ON public.rr_team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.rr_teams t
                 JOIN public.rr_ranches r ON r.id = t.ranch_id
                 WHERE t.id = rr_team_members.team_id AND r.owner_id = auth.uid()));
-- Results are public the moment they post. That is the product.
DROP POLICY IF EXISTS "Results are public" ON public.rr_event_runs;
CREATE POLICY "Results are public" ON public.rr_event_runs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Points scales are readable" ON public.rr_points_scales;
CREATE POLICY "Points scales are readable" ON public.rr_points_scales FOR SELECT USING (true);
