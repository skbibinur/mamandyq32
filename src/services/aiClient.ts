import type {
  AbilityScore,
  AiAnalysisResult,
  ChatMessage,
  PresentationVoice,
  ProfessionPresentation,
  QuizAnswerItem,
} from '../types/career';

const FUNCTION_ENDPOINT = '/.netlify/functions/career-ai';
const presentationCache = new Map<string, ProfessionPresentation>();

export async function requestCareerAnalysis(
  answers: QuizAnswerItem[],
  abilityProfile?: AbilityScore[]
): Promise<AiAnalysisResult> {
  const response = await fetch(FUNCTION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyze',
      answers,
      abilityProfile,
    }),
  });

  const data = (await response.json()) as {
    result?: AiAnalysisResult;
    error?: string;
  };

  if (!response.ok || !data.result) {
    throw new Error(data.error || 'Нәтижені талдау сәтсіз аяқталды.');
  }

  return data.result;
}

export async function requestCounselorReply(params: {
  message: string;
  history: ChatMessage[];
  testContext: AiAnalysisResult | null;
}): Promise<string> {
  const response = await fetch(FUNCTION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      message: params.message,
      history: params.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      testContext: params.testContext,
    }),
  });

  const data = (await response.json()) as {
    reply?: string;
    error?: string;
  };

  if (!response.ok || !data.reply) {
    throw new Error(data.error || 'Кеңесші жауабын алу мүмкін болмады.');
  }

  return data.reply;
}

export async function requestProfessionPresentation(params: {
  programCode: string;
  voiceName?: PresentationVoice;
  audioOnly?: boolean;
  scriptOverride?: string;
  forceRefresh?: boolean;
}): Promise<ProfessionPresentation> {
  const voice: PresentationVoice = params.voiceName ?? 'Kore';
  const cacheKey = `${params.programCode}:${voice}`;

  if (!params.forceRefresh && !params.audioOnly) {
    const cached = presentationCache.get(cacheKey);
    if (cached && cached.audioBase64) {
      return cached;
    }
  }

  const response = await fetch(FUNCTION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'presentation',
      programCode: params.programCode,
      voiceName: voice,
      audioOnly: params.audioOnly,
      scriptOverride: params.scriptOverride,
    }),
  });

  const data = (await response.json()) as {
    presentation?: ProfessionPresentation;
    error?: string;
  };

  if (!response.ok || !data.presentation) {
    throw new Error(data.error || 'Мамандық презентациясын жасау мүмкін болмады.');
  }

  if (!params.audioOnly) {
    if (presentationCache.size >= 12) {
      const oldestKey = presentationCache.keys().next().value;
      if (oldestKey) presentationCache.delete(oldestKey);
    }
    presentationCache.set(cacheKey, data.presentation);
  }

  return data.presentation;
}

