// lib/candidateFeedbackTone.ts
/**
 * Tone of the AI feedback a candidate sees right after uploading their CV.
 * Chosen per position by the HR manager (openedpositions.candidate_feedback_tone).
 * Ordered from most direct to softest.
 */

export const CANDIDATE_FEEDBACK_TONES = ['direct', 'balanced', 'warm', 'very_soft'] as const;

export type CandidateFeedbackTone = (typeof CANDIDATE_FEEDBACK_TONES)[number];

export const DEFAULT_CANDIDATE_FEEDBACK_TONE: CandidateFeedbackTone = 'balanced';

export function isCandidateFeedbackTone(value: unknown): value is CandidateFeedbackTone {
  return typeof value === 'string' && (CANDIDATE_FEEDBACK_TONES as readonly string[]).includes(value);
}

const TONE_GUIDANCE: Record<CandidateFeedbackTone, string> = {
  direct:
    'Be direct and concise. State clearly how well the profile matches the role and name the main gaps plainly, without softening phrases. Stay professional and respectful; never be harsh or personal.',
  balanced:
    'Be honest and constructive. Acknowledge the strengths of the profile, then explain the gaps clearly and neutrally.',
  warm:
    'Be warm and encouraging. Open with genuine strengths, present the gaps as areas to develop, and keep a supportive, positive tone.',
  very_soft:
    'Be very gentle and empathetic. Emphasize what the candidate does well, mention gaps tactfully as opportunities for growth, and thank them sincerely for their interest.',
};

/**
 * Instruction appended to the CV analysis prompt. It only governs the wording
 * of candidateFeedback, so the score and HR analysis stay comparable across
 * positions whatever tone was chosen.
 */
export function buildCandidateFeedbackToneInstruction(tone: CandidateFeedbackTone): string {
  return [
    '',
    'TONE OF "candidateFeedback":',
    TONE_GUIDANCE[tone],
    'This tone applies ONLY to the "candidateFeedback" field. Do not change the score, the "analysis" field, or the factual content of the assessment because of it. Keep the same language and JSON format as instructed above.',
  ].join('\n');
}
