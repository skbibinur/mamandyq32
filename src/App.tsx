import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { QuizSection } from './components/QuizSection';
import { ResultsSection } from './components/ResultsSection';
import { AiCounselorSection } from './components/AiCounselorSection';
import { CatalogSection } from './components/CatalogSection';
import { CompareSection } from './components/CompareSection';
import { Footer } from './components/Footer';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import {
  addPersonalGoal,
  buildQuizSummaryPayload,
  computeAbilityProfile,
  deletePersonalGoal,
  toggleComparisonSelection,
  togglePersonalGoal,
  updatePersonalGoalTitle,
} from './utils/careerLogic';
import { requestCareerAnalysis, requestCounselorReply } from './services/aiClient';
import type {
  AiAnalysisResult,
  AppSection,
  ChatMessage,
  EducationProgramItem,
  GoalHorizon,
  PersonalGoal,
} from './types/career';

const PERSONAL_PLAN_STORAGE_KEY = 'onai_komek_personal_plan_v1';

function loadStoredGoals(): PersonalGoal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PERSONAL_PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PersonalGoal[]) : [];
  } catch {
    return [];
  }
}

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'quiz';
      }
    }
    return 'home';
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizKey, setQuizKey] = useState(0);

  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>(loadStoredGoals);

  useEffect(() => {
    try {
      window.localStorage.setItem(PERSONAL_PLAN_STORAGE_KEY, JSON.stringify(personalGoals));
    } catch {
      // ignore storage quota errors
    }
  }, [personalGoals]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const handleNavigate = (section: AppSection) => {
    setActiveSection(section);
  };

  const handleStartTest = () => {
    setAnalysisError(null);
    setActiveSection('quiz');
  };

  const handleRetakeTest = () => {
    setQuizAnswers({});
    setAnalysisResult(null);
    setAnalysisError(null);
    setQuizKey((k) => k + 1);
    setActiveSection('quiz');
  };

  const handleSelectAnswer = (questionId: string, rating: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const handleSubmitQuiz = async () => {
    const payload = buildQuizSummaryPayload(QUIZ_QUESTIONS, quizAnswers);
    const abilityProfile = computeAbilityProfile(quizAnswers, QUIZ_QUESTIONS);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setActiveSection('results');

    try {
      const result = await requestCareerAnalysis(payload, abilityProfile);
      setAnalysisResult(result);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Нәтижені талдау кезінде қате шықты. Қайталап көріңіз.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: formatCurrentTime(),
    };

    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setIsSendingChat(true);
    setChatError(null);

    try {
      const replyText = await requestCounselorReply({
        message: text,
        history: chatMessages,
        testContext: analysisResult,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: formatCurrentTime(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'AI кеңесшіден жауап алу мүмкін болмады.';
      setChatError(msg);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleToggleCompare = (professionId: string) => {
    const res = toggleComparisonSelection(compareIds, professionId, 3);
    setCompareIds(res.nextIds);
    return { limitReached: res.limitReached };
  };

  const handleAskAboutProgram = (program: EducationProgramItem) => {
    setActiveSection('counselor');
    const question = `Маған ${program.code} «${program.title}» бағыты туралы толығырақ айтып берші: мектепте қандай дағдыларды дамытқан жөн және болашақ жұмыс мүмкіндіктері қандай?`;
    void handleSendMessage(question);
  };

  const handleAddGoal = (params: {
    title: string;
    horizon: GoalHorizon;
    timeframe?: string;
  }): string | null => {
    const { nextGoals, error } = addPersonalGoal(personalGoals, params);
    if (!error) {
      setPersonalGoals(nextGoals);
    }
    return error;
  };

  const handleToggleGoal = (goalId: string) => {
    setPersonalGoals((prev) => togglePersonalGoal(prev, goalId));
  };

  const handleUpdateGoal = (goalId: string, nextTitle: string) => {
    setPersonalGoals((prev) => updatePersonalGoalTitle(prev, goalId, nextTitle));
  };

  const handleDeleteGoal = (goalId: string) => {
    setPersonalGoals((prev) => deletePersonalGoal(prev, goalId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#263238]">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onStartTest={handleStartTest}
        compareCount={compareIds.length}
        hasResults={Boolean(analysisResult)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {activeSection === 'home' && (
          <HomeSection
            onStartTest={handleStartTest}
            onNavigate={handleNavigate}
            hasResults={Boolean(analysisResult)}
          />
        )}

        {activeSection === 'quiz' && (
          <QuizSection
            key={quizKey}
            answers={quizAnswers}
            onSelectAnswer={handleSelectAnswer}
            onSubmitQuiz={handleSubmitQuiz}
            isSubmitting={isAnalyzing}
            submitError={analysisError}
          />
        )}

        {activeSection === 'results' && (
          <ResultsSection
            result={analysisResult}
            isLoading={isAnalyzing}
            error={analysisError}
            personalGoals={personalGoals}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onRetakeTest={handleRetakeTest}
            onRetryAnalyze={handleSubmitQuiz}
            onAskCounselor={() => handleNavigate('counselor')}
            onExploreCatalog={() => handleNavigate('catalog')}
          />
        )}

        {activeSection === 'counselor' && (
          <AiCounselorSection
            messages={chatMessages}
            isSending={isSendingChat}
            error={chatError}
            testContext={analysisResult}
            onSendMessage={handleSendMessage}
            onClearChat={() => {
              setChatMessages([]);
              setChatError(null);
            }}
            onStartTest={handleStartTest}
          />
        )}

        {activeSection === 'catalog' && (
          <CatalogSection
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onOpenCompare={() => handleNavigate('compare')}
            onAskAboutProgram={handleAskAboutProgram}
          />
        )}

        {activeSection === 'compare' && (
          <CompareSection
            compareIds={compareIds}
            onSetCompareIds={setCompareIds}
            onGoToCatalog={() => handleNavigate('catalog')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
