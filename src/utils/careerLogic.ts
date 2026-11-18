import { ABILITIES, LIKERT_SCALE } from '../data/abilities';
import { EDU_PROGRAMS } from '../data/eduPrograms';
import type {
  AbilityCombination,
  AbilityScore,
  AiAnalysisResult,
  CareerRecommendation,
  EduProgramCategory,
  EducationProgramItem,
  GoalFilter,
  GoalHorizon,
  GrowthArea,
  PersonalGoal,
  PresentationSlide,
  PresentationSlideTheme,
  ProfessionCategory,
  ProfessionItem,
  ProfessionPresentation,
  QuizAnswerItem,
  QuizQuestion,
  StrengthDetail,
} from '../types/career';

export function validateQuizAnswers(
  answers: Record<string, number>,
  questions: QuizQuestion[]
): { isValid: boolean; missingQuestionIndexes: number[] } {
  const missingQuestionIndexes: number[] = [];
  questions.forEach((q, idx) => {
    const val = answers[q.id];
    if (typeof val !== 'number' || val < 1 || val > 5 || !Number.isInteger(val)) {
      missingQuestionIndexes.push(idx);
    }
  });
  return {
    isValid: missingQuestionIndexes.length === 0,
    missingQuestionIndexes,
  };
}

export function getAbilityLevelLabel(percentage: number): string {
  if (percentage >= 80) return 'Айқын басым';
  if (percentage >= 60) return 'Жақсы дамыған';
  if (percentage >= 40) return 'Орташа деңгей';
  return 'Дамытуға ашық';
}

export function computeAbilityProfile(
  answers: Record<string, number>,
  questions: QuizQuestion[]
): AbilityScore[] {
  const scores: AbilityScore[] = ABILITIES.map((ability) => {
    const relatedQuestions = questions.filter((q) => q.abilityId === ability.id);
    const count = Math.max(relatedQuestions.length, 1);
    const maxScore = count * 5;
    const rawScore = relatedQuestions.reduce((acc, q) => {
      const val = answers[q.id];
      const clamped = typeof val === 'number' && val >= 1 && val <= 5 ? val : 1;
      return acc + clamped;
    }, 0);
    const average = Number((rawScore / count).toFixed(1));
    const percentage = Math.round((rawScore / maxScore) * 100);

    return {
      abilityId: ability.id,
      order: ability.order,
      title: ability.title,
      shortDescription: ability.shortDescription,
      iconName: ability.iconName,
      rawScore,
      maxScore,
      average,
      percentage,
      levelLabel: getAbilityLevelLabel(percentage),
    };
  });

  // Sort strictly descending by percentage, then rawScore, then original order
  return scores.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    return a.order - b.order;
  });
}

export function buildQuizSummaryPayload(
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizAnswerItem[] {
  const abilityById = new Map(ABILITIES.map((a) => [a.id, a]));
  const scaleByValue = new Map(LIKERT_SCALE.map((s) => [s.value, s.label]));

  return questions.map((q) => {
    const rating = answers[q.id] ?? 1;
    const ability = abilityById.get(q.abilityId);
    return {
      questionId: q.id,
      abilityId: q.abilityId,
      abilityTitle: ability?.title ?? q.abilityId,
      contextHint: q.contextHint,
      question: q.question,
      rating,
      ratingLabel: scaleByValue.get(rating as 1 | 2 | 3 | 4 | 5) ?? `${rating} / 5`,
    };
  });
}

export function filterProfessions(
  professions: ProfessionItem[],
  searchQuery: string,
  category: ProfessionCategory
): ProfessionItem[] {
  const normalized = searchQuery.trim().toLowerCase();
  return professions.filter((item) => {
    const matchesCategory = category === 'Барлығы' || item.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const searchable = [
      item.title,
      item.category,
      item.shortSummary,
      ...item.duties,
      ...item.skills,
      ...item.subjects,
      ...item.industries,
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(normalized);
  });
}

function normalizeCodeSearch(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/в/g, 'b')
    .replace(/м/g, 'm');
}

export function filterEduPrograms(
  programs: EducationProgramItem[],
  searchQuery: string,
  subjectPair: string,
  category: EduProgramCategory = 'Барлығы'
): EducationProgramItem[] {
  const normalized = searchQuery.trim().toLowerCase();
  const normalizedCode = normalizeCodeSearch(searchQuery);

  return programs.filter((item) => {
    const matchesCategory = category === 'Барлығы' || item.category === category;
    if (!matchesCategory) {
      return false;
    }
    const matchesPair = subjectPair === 'Барлығы' || item.subjectPair === subjectPair;
    if (!matchesPair) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const textMatch =
      item.code.toLowerCase().includes(normalizedCode) ||
      item.title.toLowerCase().includes(normalized) ||
      item.subject1.toLowerCase().includes(normalized) ||
      item.subject2.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      item.skills.some((s) => s.toLowerCase().includes(normalized));
    return textMatch;
  });
}

export function findMatchingEduPrograms(
  programs: EducationProgramItem[],
  query: string,
  limit = 12
): EducationProgramItem[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/[\s,.;:!?()]+/)
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) {
    return [];
  }

  const scored = programs
    .map((p) => {
      const hay = `${p.code} ${p.title} ${p.subject1} ${p.subject2}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        const normCodeToken = normalizeCodeSearch(token);
        if (p.code.toLowerCase() === normCodeToken) {
          score += 10;
        } else if (hay.includes(token) || hay.includes(normCodeToken)) {
          score += 2;
        }
      }
      return { item: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((e) => e.item);
}

export function toggleComparisonSelection(
  currentIds: string[],
  targetId: string,
  maxItems = 3
): { nextIds: string[]; limitReached: boolean } {
  if (currentIds.includes(targetId)) {
    return {
      nextIds: currentIds.filter((id) => id !== targetId),
      limitReached: false,
    };
  }
  if (currentIds.length >= maxItems) {
    return {
      nextIds: currentIds,
      limitReached: true,
    };
  }
  return {
    nextIds: [...currentIds, targetId],
    limitReached: false,
  };
}

function sanitizeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) {
    return [];
  }
  return val
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

export function parseAiResultJson(
  rawText: string,
  abilityProfile: AbilityScore[]
): AiAnalysisResult {
  const trimmed = rawText.trim();
  const unfenced = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(unfenced) as Record<string, unknown>;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI жауабының құрылымы жарамсыз.');
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const disclaimer = typeof parsed.disclaimer === 'string' ? parsed.disclaimer.trim() : '';

  const scoreByTitle = new Map(abilityProfile.map((a) => [a.title.toLowerCase(), a.percentage]));

  const rawStrengths = Array.isArray(parsed.topStrengths) ? parsed.topStrengths : [];
  const topStrengths: StrengthDetail[] = rawStrengths
    .slice(0, 5)
    .map((item): StrengthDetail => {
      const s = item as Record<string, unknown>;
      const abilityTitle = typeof s.abilityTitle === 'string' ? s.abilityTitle.trim() : '';
      const explanation = typeof s.explanation === 'string' ? s.explanation.trim() : '';
      const deterministicPct = scoreByTitle.get(abilityTitle.toLowerCase());
      const pct =
        deterministicPct ??
        (typeof s.percentage === 'number' ? Math.round(s.percentage) : 0);
      return {
        abilityTitle,
        percentage: pct,
        explanation,
      };
    })
    .filter((s) => s.abilityTitle.length > 0 && s.explanation.length > 0);

  const rawCombos = Array.isArray(parsed.abilityCombinations) ? parsed.abilityCombinations : [];
  const abilityCombinations: AbilityCombination[] = rawCombos
    .slice(0, 4)
    .map((item): AbilityCombination => {
      const c = item as Record<string, unknown>;
      return {
        pairTitle: typeof c.pairTitle === 'string' ? c.pairTitle.trim() : '',
        abilities: sanitizeStringArray(c.abilities),
        meaning: typeof c.meaning === 'string' ? c.meaning.trim() : '',
      };
    })
    .filter((c) => c.pairTitle.length > 0 && c.meaning.length > 0);

  const rawGrowth = Array.isArray(parsed.growthAreas) ? parsed.growthAreas : [];
  const growthAreas: GrowthArea[] = rawGrowth
    .slice(0, 4)
    .map((item): GrowthArea => {
      const g = item as Record<string, unknown>;
      const abilityTitle = typeof g.abilityTitle === 'string' ? g.abilityTitle.trim() : '';
      const deterministicPct = scoreByTitle.get(abilityTitle.toLowerCase());
      const pct =
        deterministicPct ??
        (typeof g.percentage === 'number' ? Math.round(g.percentage) : 0);
      return {
        abilityTitle,
        percentage: pct,
        advice: typeof g.advice === 'string' ? g.advice.trim() : '',
        exercises: sanitizeStringArray(g.exercises),
      };
    })
    .filter((g) => g.abilityTitle.length > 0 && g.advice.length > 0);

  const programByCode = new Map(EDU_PROGRAMS.map((p) => [p.code.toLowerCase(), p]));
  const programByTitle = new Map(EDU_PROGRAMS.map((p) => [p.title.toLowerCase(), p]));

  const rawRecs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  const recommendations: CareerRecommendation[] = rawRecs
    .slice(0, 7)
    .map((rec): CareerRecommendation => {
      const r = rec as Record<string, unknown>;
      const rawCode = typeof r.programCode === 'string' ? r.programCode.trim() : '';
      const title = typeof r.title === 'string' ? r.title.trim() : '';
      const normalizedCode = normalizeCodeSearch(rawCode);
      const matchedProgram =
        (normalizedCode ? programByCode.get(normalizedCode) : undefined) ??
        (title ? programByTitle.get(title.toLowerCase()) : undefined);

      const officialSubjects = matchedProgram
        ? matchedProgram.subject1 === 'Шығармашылық емтихан'
          ? ['Шығармашылық емтихан']
          : [matchedProgram.subject1, matchedProgram.subject2]
        : sanitizeStringArray(r.schoolSubjects);

      return {
        programCode: matchedProgram?.code ?? (rawCode || undefined),
        title: title || matchedProgram?.title || '',
        relatedField:
          (typeof r.relatedField === 'string' ? r.relatedField.trim() : '') ||
          matchedProgram?.category ||
          '',
        whatTheyDo: typeof r.whatTheyDo === 'string' ? r.whatTheyDo.trim() : '',
        matchingAbilities: sanitizeStringArray(r.matchingAbilities),
        matchReason: typeof r.matchReason === 'string' ? r.matchReason.trim() : '',
        schoolSubjects: officialSubjects,
        skillsToDevelop: sanitizeStringArray(r.skillsToDevelop),
      };
    })
    .filter((r) => r.title.length > 0 && r.matchReason.length > 0 && r.whatTheyDo.length > 0);

  const nextSteps = sanitizeStringArray(parsed.nextSteps).slice(0, 5);

  if (
    !summary ||
    topStrengths.length < 3 ||
    abilityCombinations.length < 1 ||
    growthAreas.length < 1 ||
    recommendations.length < 5 ||
    nextSteps.length < 3
  ) {
    throw new Error('AI талдау нәтижесі толық қалыптаспады (кемінде 5 мамандық пен талдау бөлімдері қажет).');
  }

  return {
    summary,
    disclaimer:
      disclaimer ||
      'Бұл нәтиже нақты үкім немесе кәсіби диагноз емес — тек өз қабілеттерің мен мамандықтарды зерттеуге арналған бағдар.',
    abilityProfile,
    topStrengths,
    abilityCombinations,
    growthAreas,
    recommendations,
    nextSteps,
  };
}

export function addPersonalGoal(
  goals: PersonalGoal[],
  params: { title: string; horizon: GoalHorizon; timeframe?: string }
): { nextGoals: PersonalGoal[]; error: string | null } {
  const trimmedTitle = params.title.trim();
  if (!trimmedTitle) {
    return {
      nextGoals: goals,
      error: 'Мақсат мәтінін бос қалдырмай жазыңыз.',
    };
  }

  const duplicate = goals.some(
    (g) => g.title.toLowerCase() === trimmedTitle.toLowerCase() && g.horizon === params.horizon
  );
  if (duplicate) {
    return {
      nextGoals: goals,
      error: 'Бұл мақсат таңдалған бөлімде бұрыннан бар.',
    };
  }

  const newGoal: PersonalGoal = {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: trimmedTitle,
    horizon: params.horizon,
    timeframe: (params.timeframe ?? '').trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  return {
    nextGoals: [newGoal, ...goals],
    error: null,
  };
}

export function togglePersonalGoal(goals: PersonalGoal[], goalId: string): PersonalGoal[] {
  return goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g));
}

export function updatePersonalGoalTitle(
  goals: PersonalGoal[],
  goalId: string,
  nextTitle: string
): PersonalGoal[] {
  const trimmed = nextTitle.trim();
  if (!trimmed) {
    return goals;
  }
  return goals.map((g) => (g.id === goalId ? { ...g, title: trimmed } : g));
}

export function deletePersonalGoal(goals: PersonalGoal[], goalId: string): PersonalGoal[] {
  return goals.filter((g) => g.id !== goalId);
}

export function filterPersonalGoals(
  goals: PersonalGoal[],
  horizon: GoalHorizon,
  statusFilter: GoalFilter
): PersonalGoal[] {
  return goals.filter((g) => {
    if (g.horizon !== horizon) return false;
    if (statusFilter === 'active') return !g.completed;
    if (statusFilter === 'completed') return g.completed;
    return true;
  });
}

export function computeGoalProgress(goals: PersonalGoal[]): {
  total: number;
  completed: number;
  percentage: number;
  shortTotal: number;
  shortCompleted: number;
  longTotal: number;
  longCompleted: number;
} {
  const total = goals.length;
  const completed = goals.filter((g) => g.completed).length;
  const shortGoals = goals.filter((g) => g.horizon === 'short');
  const longGoals = goals.filter((g) => g.horizon === 'long');

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    shortTotal: shortGoals.length,
    shortCompleted: shortGoals.filter((g) => g.completed).length,
    longTotal: longGoals.length,
    longCompleted: longGoals.filter((g) => g.completed).length,
  };
}

const VALID_SLIDE_THEMES: PresentationSlideTheme[] = ['overview', 'subjects', 'skills', 'future'];

export function parsePresentationJson(
  rawText: string,
  program: EducationProgramItem
): Pick<
  ProfessionPresentation,
  'programCode' | 'programTitle' | 'category' | 'subjectPairLabel' | 'introHook' | 'slides' | 'fullNarrationScript'
> {
  const trimmed = rawText.trim();
  const unfenced = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(unfenced) as Record<string, unknown>;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI презентация деректерінің құрылымы жарамсыз.');
  }

  const introHook =
    typeof parsed.introHook === 'string' && parsed.introHook.trim().length > 0
      ? parsed.introHook.trim()
      : `${program.title} — заманауи сұранысқа ие мамандық бағыттарының бірі.`;

  const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];
  const slides: PresentationSlide[] = rawSlides
    .slice(0, 4)
    .map((item, idx): PresentationSlide => {
      const s = item as Record<string, unknown>;
      const rawTheme = typeof s.theme === 'string' ? s.theme.trim().toLowerCase() : '';
      const theme: PresentationSlideTheme = VALID_SLIDE_THEMES.includes(
        rawTheme as PresentationSlideTheme
      )
        ? (rawTheme as PresentationSlideTheme)
        : VALID_SLIDE_THEMES[idx % VALID_SLIDE_THEMES.length];

      const keyPoints = sanitizeStringArray(s.keyPoints).slice(0, 3);
      return {
        id: `slide-${idx + 1}`,
        theme,
        chapterLabel:
          typeof s.chapterLabel === 'string' && s.chapterLabel.trim()
            ? s.chapterLabel.trim()
            : `0${idx + 1} · Бөлім`,
        headline: typeof s.headline === 'string' ? s.headline.trim() : '',
        narration: typeof s.narration === 'string' ? s.narration.trim() : '',
        keyPoints,
        highlightMetric:
          typeof s.highlightMetric === 'string' && s.highlightMetric.trim()
            ? s.highlightMetric.trim()
            : `${program.code} · ${program.category}`,
      };
    })
    .filter((s) => s.headline.length > 0 && s.narration.length > 0);

  if (slides.length < 3) {
    throw new Error('AI презентация слайдтары толық қалыптаспады.');
  }

  const fullNarrationScript = slides.map((s) => s.narration).join(' ');
  const subjectPairLabel =
    program.subject1 === program.subject2
      ? program.subject1
      : `${program.subject1} + ${program.subject2}`;

  return {
    programCode: program.code,
    programTitle: program.title,
    category: program.category,
    subjectPairLabel,
    introHook,
    slides,
    fullNarrationScript,
  };
}

export function computeSlideTimeRanges(
  slides: PresentationSlide[]
): Array<{ startRatio: number; endRatio: number }> {
  if (slides.length === 0) return [];
  const weights = slides.map((s) => Math.max(s.narration.trim().length, 20));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let cursor = 0;

  return weights.map((w, idx) => {
    const startRatio = cursor;
    const endRatio = idx === weights.length - 1 ? 1 : cursor + w / total;
    cursor = endRatio;
    return { startRatio, endRatio };
  });
}
