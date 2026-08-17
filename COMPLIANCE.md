# AI Act Compliance Note — Candidate Scoring & Ranking

Factual note on the EU AI Act (Regulation (EU) 2024/1689) status of HRInno's
AI-based candidate scoring feature. This documents what the feature does and
what the Act requires of it — it does not certify compliance, and it does
not change the feature's behaviour. Final compliance determination requires
legal review.

## What the feature does

- **`/api/analyse-cv`** ([route.ts](src/app/api/analyse-cv/route.ts)) — scores
  a single uploaded CV against a job description (0–100) and extracts
  candidate contact fields, using an LLM via OpenRouter (`openai/gpt-3.5-turbo`,
  with fallback to `anthropic/claude-3-haiku` or `mistralai/mistral-small`).
  The score and AI-generated analysis are stored per candidate/position
  (`position_to_candidat.candidat_score`, `candidat_ai_analyse`) and drive
  the recruiter-facing candidate ranking in the pipeline UI.
- **`/api/analyse-massive`** ([route.ts](src/app/api/analyse-massive/route.ts))
  — re-runs the same scoring for every already-stored candidate in a company
  against a new position.
- Recruiters see the AI score prominently in the candidate list/pipeline and
  can sort/filter by it. The score is advisory — the recruiter makes the
  actual hiring decision — but nothing in the current UI states this
  explicitly to either the recruiter or the candidate.

## Why the AI Act applies

The AI Act's Annex III, point 4(a) classifies as **high-risk** AI systems
"intended to be used for the recruitment or selection of natural persons, in
particular to place targeted job advertisements, to analyse and filter job
applications, and to evaluate candidates." Scoring and ranking candidates
against a job description is squarely this use case.

High-risk obligations for Annex III systems became applicable **2 August
2026** (24 months after the Act's entry into force). As of this note's date
(17 August 2026), that date has passed.

## What high-risk classification would require (Articles 8–27, 29 AI Act)

None of the following currently exist for this feature:

- **Risk management system** (Art. 9) — documented, iterative process
  identifying and mitigating risks (e.g. discriminatory scoring).
- **Data governance** (Art. 10) — documented review of training/prompt data
  for bias, relevance, representativeness.
- **Technical documentation** (Art. 11, Annex IV) — how the system works,
  its scoring logic, intended purpose, known limitations.
- **Record-keeping / logging** (Art. 12) — automatic logs of each scoring
  event sufficient to reconstruct why a given score was produced. Today,
  only the final score and free-text analysis are stored — no structured
  log of the prompt/response pair for audit purposes.
- **Transparency to the deployer** (Art. 13) — instructions for use covering
  capabilities, limitations, and appropriate human oversight measures.
- **Human oversight** (Art. 14) — the current UI shows the recruiter a score
  and lets them act on it, but does not implement a documented human
  oversight measure (e.g. a required review step before a candidate is
  auto-rejected on score alone). No auto-rejection currently exists in the
  code — a recruiter must take a manual action per candidate — but this
  isn't formally documented as the oversight control.
- **Accuracy, robustness, cybersecurity** (Art. 15) — no formal accuracy
  testing or documented robustness measures for the scoring output.
- **Conformity assessment & registration** (Art. 43, 49) — no conformity
  assessment has been performed; the system is not registered in the EU
  database of high-risk AI systems.
- **Candidate-facing transparency**: Article 26(11) requires deployers using
  a high-risk AI system to evaluate candidates to inform those natural
  persons that the system is being used. Candidates are not currently
  informed that their application is scored by AI, on the homepage demo,
  the job-application flow, or the privacy notice (the privacy notice
  mentions AI processing generically but not this specific use).

## What this note does not do

- It does not implement any of the above — this is a documentation-only
  change with no code or behaviour modification.
- It does not determine whether HRInno, as currently operated (low-volume,
  no active promotion), is already in scope for enforcement, whether any
  exemption applies, or what the realistic compliance priority order should
  be. That requires a lawyer familiar with the AI Act and the specific scale
  of HRInno's usage.
- It does not assess the medical certificate OCR/extraction feature — that
  is a data-extraction tool, not a scoring/evaluation-of-candidates system,
  and is not covered by Annex III point 4(a) on the same basis.

## Requires a human/legal decision

1. Whether HRInno's current usage volume/status triggers practical
   enforcement risk now, and what the realistic remediation timeline should
   be given the 2 August 2026 applicability date has already passed.
2. Whether the candidate-facing "AI is used to evaluate you" notice
   (Art. 26(11)) should be added to the job-application flow, and where.
3. Whether a lighter-weight interim risk-management/logging measure is
   feasible before the full technical documentation and conformity
   assessment are built out.
