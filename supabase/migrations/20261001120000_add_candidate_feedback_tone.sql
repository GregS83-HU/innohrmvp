-- Per-position tone for the AI feedback shown to a candidate right after they
-- upload their CV (src/app/api/analyse-cv/route.ts). Chosen by the HR manager
-- when creating the position (lib/candidateFeedbackTone.ts lists the levels).
-- Only the wording of the candidate-facing feedback changes; the score and the
-- HR-side analysis are unaffected. Existing positions get 'balanced', which is
-- the closest match to the feedback the AI produced before this setting existed.

alter table public.openedpositions
  add column if not exists candidate_feedback_tone text not null default 'balanced';

alter table public.openedpositions
  drop constraint if exists openedpositions_candidate_feedback_tone_check;

alter table public.openedpositions
  add constraint openedpositions_candidate_feedback_tone_check
  check (candidate_feedback_tone in ('direct', 'balanced', 'warm', 'very_soft'));

comment on column public.openedpositions.candidate_feedback_tone is
  'Tone of the AI feedback shown to candidates after a CV upload: direct, balanced, warm or very_soft. Affects wording only, never the score or HR analysis.';
