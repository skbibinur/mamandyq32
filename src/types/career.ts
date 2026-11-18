export type AppSection = 'home' | 'quiz' | 'results' | 'counselor' | 'catalog' | 'compare';

export type AbilityId =
  | 'physical'
  | 'spatial'
  | 'social'
  | 'nature'
  | 'aesthetic'
  | 'linguistic'
  | 'logical'
  | 'informational'
  | 'meaning'
  | 'systemic'
  | 'innovative'
  | 'ai_literacy';

export type AbilityIconName =
  | 'Activity'
  | 'Box'
  | 'Users'
  | 'Leaf'
  | 'Palette'
  | 'Languages'
  | 'Calculator'
  | 'SearchCheck'
  | 'Compass'
  | 'Workflow'
  | 'Lightbulb'
  | 'Cpu';

export interface AbilityDefinition {
  id: AbilityId;
  order: number;
  title: string;
  shortDescription: string;
  iconName: AbilityIconName;
}

export interface LikertOption {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  shortLabel: string;
}

export interface QuizQuestion {
  id: string;
  abilityId: AbilityId;
  contextHint: string;
  question: string;
}

export interface AbilityScore {
  abilityId: AbilityId;
  order: number;
  title: string;
  shortDescription: string;
  iconName: AbilityIconName;
  rawScore: number;
  maxScore: number;
  average: number;
  percentage: number;
  levelLabel: string;
}

export interface QuizAnswerItem {
  questionId: string;
  abilityId: AbilityId;
  abilityTitle: string;
  contextHint: string;
  question: string;
  rating: number;
  ratingLabel: string;
}

export interface StrengthDetail {
  abilityTitle: string;
  percentage: number;
  explanation: string;
}

export interface AbilityCombination {
  pairTitle: string;
  abilities: string[];
  meaning: string;
}

export interface GrowthArea {
  abilityTitle: string;
  percentage: number;
  advice: string;
  exercises: string[];
}

export interface CareerRecommendation {
  programCode?: string;
  title: string;
  relatedField: string;
  whatTheyDo: string;
  matchingAbilities: string[];
  matchReason: string;
  schoolSubjects: string[];
  skillsToDevelop: string[];
}

export interface AiAnalysisResult {
  summary: string;
  disclaimer: string;
  abilityProfile: AbilityScore[];
  topStrengths: StrengthDetail[];
  abilityCombinations: AbilityCombination[];
  growthAreas: GrowthArea[];
  recommendations: CareerRecommendation[];
  nextSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ProfessionCategory =
  | 'Барлығы'
  | 'IT және деректер'
  | 'Дизайн және креатив'
  | 'Медицина және биоғылым'
  | 'Инженерия және жасыл энергетика'
  | 'Бизнес, қаржы және құқық'
  | 'Білім, психология және медиа';

export interface ProfessionItem {
  id: string;
  title: string;
  category: Exclude<ProfessionCategory, 'Барлығы'>;
  shortSummary: string;
  duties: string[];
  skills: string[];
  subjects: string[];
  industries: string[];
  workStyle: string;
}

export type EduProgramCategory =
  | 'Барлығы'
  | 'Білім және педагогика'
  | 'Өнер, дизайн және медиа'
  | 'Гуманитарлық және әлеуметтік ғылымдар'
  | 'Бизнес, басқару және құқық'
  | 'IT, математика және жаратылыстану'
  | 'Инженерия, өндіріс және құрылыс'
  | 'Ауыл шаруашылығы және экология'
  | 'Медицина, сервис және қауіпсіздік';

export interface EducationProgramItem {
  code: string;
  title: string;
  subject1: string;
  subject2: string;
  subjectPair: string;
  category: Exclude<EduProgramCategory, 'Барлығы'>;
  shortSummary: string;
  duties: string[];
  skills: string[];
  industries: string[];
}

export type GoalHorizon = 'short' | 'long';

export type GoalFilter = 'all' | 'active' | 'completed';

export interface PersonalGoal {
  id: string;
  title: string;
  horizon: GoalHorizon;
  timeframe: string;
  completed: boolean;
  createdAt: string;
}

export type PresentationVoice = 'Kore' | 'Puck' | 'Zephyr';

export type PresentationSlideTheme = 'overview' | 'subjects' | 'skills' | 'future';

export interface PresentationSlide {
  id: string;
  theme: PresentationSlideTheme;
  chapterLabel: string;
  headline: string;
  narration: string;
  keyPoints: string[];
  highlightMetric: string;
}

export interface ProfessionPresentation {
  programCode: string;
  programTitle: string;
  category: string;
  subjectPairLabel: string;
  introHook: string;
  slides: PresentationSlide[];
  fullNarrationScript: string;
  voiceName: PresentationVoice;
  audioBase64: string | null;
  audioMimeType: string;
  audioError?: string;
}

