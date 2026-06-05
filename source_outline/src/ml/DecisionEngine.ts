export type VerificationFrameResult = {
  faceMatch: boolean;
  livenessPass: boolean;
  recognitionScore: number;
  livenessScore: number;
  timestamp: number;
};

export type FinalDecision = 'ACCEPT' | 'REJECT' | 'ACTIVE_CHALLENGE_REQUIRED';

export function decideWithVoting(results: VerificationFrameResult[], k = 5, n = 8): FinalDecision {
  const window = results.slice(-n);
  const passCount = window.filter(r => r.faceMatch && r.livenessPass).length;
  return passCount >= k ? 'ACCEPT' : 'ACTIVE_CHALLENGE_REQUIRED';
}
