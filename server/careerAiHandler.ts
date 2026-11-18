import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { EDU_PROGRAMS } from '../src/data/eduPrograms.ts';
import { QUIZ_QUESTIONS } from '../src/data/quizQuestions.ts';
import {
  computeAbilityProfile,
  findMatchingEduPrograms,
  parseAiResultJson,
  parsePresentationJson,
} from '../src/utils/careerLogic.ts';
import type {
  AbilityScore,
  AiAnalysisResult,
  PresentationVoice,
  ProfessionPresentation,
  QuizAnswerItem,
} from '../src/types/career.ts';

export interface AnalyzePayload {
  action: 'analyze';
  answers: QuizAnswerItem[];
  abilityProfile?: AbilityScore[];
}

export interface ChatPayload {
  action: 'chat';
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  testContext?: AiAnalysisResult | null;
}

export interface PresentationPayload {
  action: 'presentation';
  programCode: string;
  voiceName?: PresentationVoice;
  audioOnly?: boolean;
  scriptOverride?: string;
}

export type CareerAiRequestBody = AnalyzePayload | ChatPayload | PresentationPayload;

export interface HandlerResponse {
  status: number;
  body: Record<string, unknown>;
}

function getGeminiClient(apiVersion?: string): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT')
  );
}

async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isTransientError(err)) {
        throw err;
      }
      const delayMs = 800 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
}

async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
  }
): Promise<string> {
  try {
    const response = await callWithRetry(
      () =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: params.contents,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction: params.systemInstruction,
            ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
            ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
          },
        }),
      2
    );
    return response.text ?? '';
  } catch (err) {
    if (!isTransientError(err)) {
      throw err;
    }
    const fallbackResponse = await callWithRetry(
      () =>
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: params.contents,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            systemInstruction: params.systemInstruction,
            ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
            ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
          },
        }),
      2
    );
    return fallbackResponse.text ?? '';
  }
}

function resolveProfileFromAnswers(
  answers: QuizAnswerItem[],
  providedProfile?: AbilityScore[]
): AbilityScore[] {
  if (Array.isArray(providedProfile) && providedProfile.length === 12) {
    return [...providedProfile].sort((a, b) => b.percentage - a.percentage);
  }
  const map: Record<string, number> = {};
  answers.forEach((item) => {
    map[item.questionId] = item.rating;
  });
  return computeAbilityProfile(map, QUIZ_QUESTIONS);
}

async function analyzeStudentAnswers(
  answers: QuizAnswerItem[],
  providedProfile?: AbilityScore[]
): Promise<AiAnalysisResult> {
  if (!Array.isArray(answers) || answers.length < 12) {
    throw new Error('INVALID_ANSWERS');
  }

  const ai = getGeminiClient();
  const profile = resolveProfileFromAnswers(answers, providedProfile);

  const profileSummaryLines = profile
    .map(
      (p, idx) =>
        `${idx + 1}. ${p.title}: ${p.percentage}% (${p.rawScore}/${p.maxScore} балл · ${p.levelLabel})`
    )
    .join('\n');

  const formattedAnswers = answers
    .map(
      (item, index) =>
        `${index + 1}. [${item.abilityTitle} · ${item.contextHint}] "${item.question}" → Бағасы: ${item.rating}/5 (${item.ratingLabel})`
    )
    .join('\n');

  const uploadedCatalogLines = EDU_PROGRAMS.map(
    (p) => `${p.code} | ${p.title} | ${p.category} | ${p.subject1} + ${p.subject2}`
  ).join('\n');

  const prompt = `Төменде мектеп оқушысының 12 қабілет бағыты бойынша (1–5 шкаласы: «Маған мүлде тән емес» — «Маған толық тән») берген нақты жауаптары мен есептелген балдары және платформадағы жүктелген 134 ресми мамандық / білім беру бағдарламалары тобының (ББТ) тізбесі берілген. Жеке деректер жоқ.

12 ҚАБІЛЕТ БЕЙІНІ (жоғарыдан төмен қарай реттелген):
${profileSummaryLines}

НАҚТЫ СҰРАҚТАР БОЙЫНША ЖАУАПТАР:
${formattedAnswers}

ЖҮКТЕЛГЕН 134 МАМАНДЫҚ / ББТ ТІЗБЕСІ (Коды | Атауы | Саласы | Бейіндік пәндері):
${uploadedCatalogLines}

ТАЛДАУ ТАЛАПТАРЫ:
1. Барлық мәтінді табиғи, оқушыға түсінікті, қолдаушы қазақ тілінде жаз.
2. Нәтиже нақты үкім немесе диагноз емес, мамандықтарды зерттеуге арналған бағдар екенін ескерт.
3. Оқушының жауабына негізделмеген қорытындыны ойдан қоспа — тек жоғарыдағы нақты балдар мен жауаптарға сүйен.
4. «topStrengths»: ең жоғары шыққан 3–5 қабілетті таңдап, олардың дәл осы оқушы жауаптарында қалай көрінгенін түсіндір (percentage мәні жоғарыдағы кестеге дәл сәйкес болсын).
5. «abilityCombinations»: оқушының жоғары және орташа-жоғары қабілеттерінің 2–3 үйлесімін талда (мысалы, «Тілдік + Әлеуметтік» немесе «Логикалық + Ақпараттық» сияқты нақты осы оқушыда бірге көрінген қабілеттер) және олардың бірге нені білдіруі мүмкін екенін түсіндір.
6. «growthAreas»: салыстырмалы түрде төменірек балл алған 2–3 қабілетті атап, оларды жетілдіруге арналған нақты, қолжетімді жаттығулар немесе күнделікті әрекеттер ұсын. ЕШҚАШАН «бұл мамандық саған келмейді» немесе «сенің қолыңнан келмейді» деген қорытынды жасама!
7. «recommendations»: жоғарыдағы ЖҮКТЕЛГЕН 134 МАМАНДЫҚ / ББТ ТІЗБЕСІНЕН оқушының қабілет бейініне сүйеніп, ӘРТҮРЛІ салалардан (бір бағытпен шектелмей) 6 мамандық (5–7 аралығында) таңдап ұсын. Әрқайсысы үшін: тізбедегі нақты «programCode» (мысалы B057), тізбедегі «title» (атауы), «relatedField» (саласы), не істейтіні, оқушының қай қабілеттеріне сәйкес келетіні, неге ұсынылғаны, тізбедегі сол кодқа сәйкес ресми бейіндік пәндері («schoolSubjects») және дамыту керек дағдылары нақты көрсетілсін. Тізбеде жоқ ойдан шығарылған код қоспа!
8. «nextSteps»: оқушы жақын арада өзі зерттеп көре алатын 4 нақты әрекет (3–5 аралығында) ұсын.`;

  const rawText = await generateWithFallback(ai, {
    contents: prompt,
    systemInstruction:
      'Сен мектеп оқушыларына арналған «Оңай көмек» профориентациялық платформасының AI талдаушысысың. Сенің міндетің — оқушының 12 қабілеті бойынша нақты жауаптарын талдап, жеке қабілет бейінін құру және берілген жүктелген 134 ресми мамандық / ББТ тізбесінен әртүрлі салалар бойынша 5-7 мамандық ұсыну. Тек берілген жауаптар мен балдарға сүйен. Төмен балл алған қабілетті «саған келмейді» деп шектеуге қолданба. Нақты үкім немесе диагноз қойма.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description:
            'Оқушының 12 қабілет бейініне жасалған қысқаша, жылы қорытынды (2-3 сөйлем).',
        },
        disclaimer: {
          type: Type.STRING,
          description:
            'Бұл нәтиже нақты үкім немесе кәсіби диагноз емес, мамандықтарды зерттеуге арналған бағдар екенін ескерту.',
        },
        topStrengths: {
          type: Type.ARRAY,
          description: 'Ең жоғары шыққан 3-5 қабілеттің сипаттамасы.',
          items: {
            type: Type.OBJECT,
            properties: {
              abilityTitle: { type: Type.STRING },
              percentage: { type: Type.INTEGER },
              explanation: {
                type: Type.STRING,
                description: 'Оқушы жауаптарына сүйенген 1-2 сөйлемдік түсіндірме.',
              },
            },
            required: ['abilityTitle', 'percentage', 'explanation'],
          },
        },
        abilityCombinations: {
          type: Type.ARRAY,
          description: '2-3 қабілет үйлесімінің талдауы.',
          items: {
            type: Type.OBJECT,
            properties: {
              pairTitle: {
                type: Type.STRING,
                description: 'Мысалы: Логикалық + Ақпараттық',
              },
              abilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              meaning: {
                type: Type.STRING,
                description:
                  'Бұл қабілеттердің бірге көрінуі оқу ісі мен мамандықтарда нені білдіруі мүмкін (2 сөйлем).',
              },
            },
            required: ['pairTitle', 'abilities', 'meaning'],
          },
        },
        growthAreas: {
          type: Type.ARRAY,
          description: 'Дамытуға болатын 2-3 қабілет және нақты жаттығулар.',
          items: {
            type: Type.OBJECT,
            properties: {
              abilityTitle: { type: Type.STRING },
              percentage: { type: Type.INTEGER },
              advice: {
                type: Type.STRING,
                description: 'Жылы әрі қолдаушы кеңес (1-2 сөйлем).',
              },
              exercises: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Осы қабілетті жетілдіруге арналған 2-3 нақты жаттығу не әрекет.',
              },
            },
            required: ['abilityTitle', 'percentage', 'advice', 'exercises'],
          },
        },
        recommendations: {
          type: Type.ARRAY,
          description: 'Жүктелген 134 ресми мамандық / ББТ тізбесінен әртүрлі салалардан 5-7 мамандық ұсынысы (ұсынылатыны 6).',
          items: {
            type: Type.OBJECT,
            properties: {
              programCode: {
                type: Type.STRING,
                description: 'Жүктелген тізбедегі ресми ББТ коды (мысалы: B057, BM086, B073).',
              },
              title: {
                type: Type.STRING,
                description: 'Жүктелген тізбедегі мамандық / білім беру бағдарламасының атауы.',
              },
              relatedField: { type: Type.STRING },
              whatTheyDo: {
                type: Type.STRING,
                description: 'Бұл маман күнделікті не істейтіні (1-2 сөйлем).',
              },
              matchingAbilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Оқушының қай қабілеттеріне сәйкес келетіні.',
              },
              matchReason: {
                type: Type.STRING,
                description: 'Оқушы жауаптары мен бейініне сүйеніп неге ұсынылғаны (1-2 сөйлем).',
              },
              schoolSubjects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Таңдалған ББТ кодына сәйкес ҰБТ бейіндік пәндері.',
              },
              skillsToDevelop: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Дамыту керек 2-3 негізгі дағды.',
              },
            },
            required: [
              'programCode',
              'title',
              'relatedField',
              'whatTheyDo',
              'matchingAbilities',
              'matchReason',
              'schoolSubjects',
              'skillsToDevelop',
            ],
          },
        },
        nextSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Оқушы өзі зерттеп көре алатын 3-5 нақты әрекет.',
        },
      },
      required: [
        'summary',
        'disclaimer',
        'topStrengths',
        'abilityCombinations',
        'growthAreas',
        'recommendations',
        'nextSteps',
      ],
    },
  });

  return parseAiResultJson(rawText, profile);
}

async function chatWithCounselor(payload: ChatPayload): Promise<string> {
  const userMessage = payload.message?.trim();
  if (!userMessage) {
    throw new Error('EMPTY_MESSAGE');
  }

  const ai = getGeminiClient();

  const contextBlock = payload.testContext
    ? `\nОқушының жақында тапсырған 12 қабілет тестінің нәтижесі:
- Жалпы бейіні: ${payload.testContext.summary}
- Күшті қабілеттері: ${payload.testContext.topStrengths
        .map((s) => `${s.abilityTitle} (${s.percentage}%)`)
        .join(', ')}
- Ұсынылған мамандықтар: ${payload.testContext.recommendations
        .map((r) => `${r.programCode ? `${r.programCode} ` : ''}${r.title} (${r.relatedField})`)
        .join(', ')}.
Осы нәтижеге сүйеніп кеңес бер, бірақ оқушыны бір ғана мамандыққа бекітпе және нәтижені үкім ретінде көрсетпе.`
    : '\nОқушы әлі тест тапсырмаған немесе жалпы мамандықтар туралы сұрап отыр.';

  const matchedPrograms = findMatchingEduPrograms(EDU_PROGRAMS, userMessage, 15);
  const matchedProgramsBlock =
    matchedPrograms.length > 0
      ? `\nСұраққа қатысты жүктелген ресми 134 ББТ тізбесінен табылған бағдарламалар мен ҰБТ бейіндік пәндері:\n${matchedPrograms
          .map((p) => `- ${p.code} ${p.title}: ${p.subject1} + ${p.subject2} (${p.category})`)
          .join('\n')}`
      : '';

  const historyLines = (payload.history ?? [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Оқушы' : 'Кеңесші'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${historyLines ? `Алдыңғы әңгіме:\n${historyLines}\n\n` : ''}Оқушының жаңа сұрағы: ${userMessage}${matchedProgramsBlock}`;

  const reply = (
    await generateWithFallback(ai, {
      contents: fullPrompt,
      systemInstruction: `Сен «Оңай көмек» профориентациялық платформасының AI кеңесшісісің.
Міндетің: мектеп оқушыларына мамандықтар, 12 қабілет бағыты, мектеп пәндері және дағдылар туралы қысқа, түсінікті, достық рәуіште қазақ тілінде жауап беру.
Ережелер:
- Жауаптарың қысқа (3-6 сөйлем немесе қысқа тармақтар), нақты әрі оқушы жасына сай болсын.
- Жеке деректерді (аты-жөні, мекенжай, телефон) сұрама.
- Оқушыны бір мамандыққа бекітпе; бірнеше мүмкін бағытты салыстырып қарауға шақыр.
- Төмен баллды ешқашан шектеу немесе «саған келмейді» деген қорытынды ретінде қолданба.${contextBlock}`,
    })
  ).trim();

  if (!reply) {
    throw new Error('EMPTY_AI_REPLY');
  }
  return reply;
}

const VALID_VOICES: PresentationVoice[] = ['Kore', 'Puck', 'Zephyr'];

async function synthesizeKazakhSpeech(
  ai: GoogleGenAI,
  narrationText: string,
  voiceName: PresentationVoice
): Promise<{ audioBase64: string | null; audioError?: string }> {
  const runTts = async (useSpeechMetadata: boolean) => {
    const part = useSpeechMetadata
      ? {
          text: narrationText,
          speechMetadata: {
            style:
              'Clear, warm, encouraging educational narrator speaking in natural Kazakh',
          },
        }
      : { text: narrationText };

    return callWithRetry(
      () =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [part],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      2
    );
  };

  try {
    let ttsResponse;
    try {
      ttsResponse = await runTts(true);
    } catch (firstErr) {
      const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      if (firstMsg.includes('400') || firstMsg.includes('INVALID_ARGUMENT')) {
        ttsResponse = await runTts(false);
      } else {
        throw firstErr;
      }
    }

    const parts = ttsResponse.candidates?.[0]?.content?.parts ?? [];
    const audioPart = parts.find((p) => Boolean(p?.inlineData?.data));
    const base64 = audioPart?.inlineData?.data ?? null;
    if (!base64) {
      return {
        audioBase64: null,
        audioError:
          'Аудио файлды дыбыстау дерегі қайтарылмады. Слайд-презентацияны көруді жалғастыра аласыз.',
      };
    }
    return { audioBase64: base64 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[careerAiHandler] TTS error:', msg);
    if (
      msg.includes('API_KEY_INVALID') ||
      msg.includes('PERMISSION_DENIED') ||
      msg.includes('403') ||
      msg.includes('401')
    ) {
      throw err;
    }
    return {
      audioBase64: null,
      audioError:
        'Аудио дыбыстау уақытша қолжетімсіз болды. Мәтіндік презентация дайын, ал дыбысты қайта жасап көруге болады.',
    };
  }
}

async function generateProfessionPresentation(
  payload: PresentationPayload
): Promise<ProfessionPresentation> {
  const rawCode = payload.programCode?.trim();
  if (!rawCode) {
    throw new Error('INVALID_PROGRAM_CODE');
  }

  const program = EDU_PROGRAMS.find(
    (p) => p.code.toLowerCase() === rawCode.toLowerCase()
  );
  if (!program) {
    throw new Error('INVALID_PROGRAM_CODE');
  }

  const voiceName: PresentationVoice = VALID_VOICES.includes(
    payload.voiceName as PresentationVoice
  )
    ? (payload.voiceName as PresentationVoice)
    : 'Kore';

  const ai = getGeminiClient();
  const ttsAi = getGeminiClient('v1beta');

  if (payload.audioOnly && payload.scriptOverride?.trim()) {
    const cleanScript = payload.scriptOverride.trim().slice(0, 1800);
    const tts = await synthesizeKazakhSpeech(ttsAi, cleanScript, voiceName);
    return {
      programCode: program.code,
      programTitle: program.title,
      category: program.category,
      subjectPairLabel:
        program.subject1 === program.subject2
          ? program.subject1
          : `${program.subject1} + ${program.subject2}`,
      introHook: '',
      slides: [],
      fullNarrationScript: cleanScript,
      voiceName,
      audioBase64: tts.audioBase64,
      audioMimeType: 'audio/wav',
      ...(tts.audioError ? { audioError: tts.audioError } : {}),
    };
  }

  const subjectsText =
    program.subject1 === program.subject2
      ? program.subject1
      : `${program.subject1} және ${program.subject2}`;

  const prompt = `Төмендегі ресми білім беру бағдарламасы (мамандық) бойынша мектеп оқушысына арналған 4 слайдты қысқаша видео-презентация мен аудио-сипаттама сценарийін құр:

МАМАНДЫҚ ДЕРЕКТЕРІ:
- Ресми коды: ${program.code}
- Атауы: ${program.title}
- Саласы: ${program.category}
- ҰБТ бейіндік пәндері: ${subjectsText}
- Қысқаша сипаттамасы: ${program.shortSummary}
- Негізгі міндеттері: ${program.duties.join('; ')}
- Қажетті дағдылар: ${program.skills.join(', ')}
- Жұмыс істейтін салалар: ${program.industries.join(', ')}

ТАЛАПТАР:
1. 4 слайд жаса. Тақырыптық реті:
   - 1-слайд (theme: "overview"): Мамандық болмысы және күнделікті жұмыс барысы.
   - 2-слайд (theme: "subjects"): Мектеп пәндері мен ҰБТ байланысы (${subjectsText} неге маңызды).
   - 3-слайд (theme: "skills"): Маманға қажетті негізгі дағдылар мен заманауи құралдар.
   - 4-слайд (theme: "future"): Қай салаларда жұмыс істеуге болады және болашақ даму мүмкіндігі.
2. Әр слайдтың «narration» мәтіні дауыстап оқуға ыңғайлы, табиғи қазақ тілінде, 2 қысқа сөйлемнен (шамамен 15–22 сөз) тұрсын. Қысқартуларсыз (мысалы «т.б.» деп жазбай) толық сөзбен жаз.
3. Әр слайдқа экранда көрсетілетін қысқа «headline» (3–6 сөз), 2–3 қысқа «keyPoints» (әрқайсысы 3–7 сөз) және «highlightMetric» (1 қысқа дерек немесе бағдар фразасы) қос.
4. «introHook» — оқушыны қызықтыратын 1 сөйлемдік кіріспе. Абсолютті үкім айтпа, зерттеуге шақыр.`;

  const rawText = await generateWithFallback(ai, {
    contents: prompt,
    systemInstruction:
      'Сен «Оңай көмек» профориентациялық платформасының білім беру контент-редакторысың. Мектеп оқушыларына түсінікті, жылы, нақты қазақ тілінде мамандықтар бойынша қысқа аудио-слайд презентация сценарийін жазасың.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        introHook: { type: Type.STRING },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING },
              chapterLabel: { type: Type.STRING },
              headline: { type: Type.STRING },
              narration: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              highlightMetric: { type: Type.STRING },
            },
            required: [
              'theme',
              'chapterLabel',
              'headline',
              'narration',
              'keyPoints',
              'highlightMetric',
            ],
          },
        },
      },
      required: ['introHook', 'slides'],
    },
  });

  const basePresentation = parsePresentationJson(rawText, program);
  const tts = await synthesizeKazakhSpeech(
    ttsAi,
    basePresentation.fullNarrationScript,
    voiceName
  );

  return {
    ...basePresentation,
    voiceName,
    audioBase64: tts.audioBase64,
    audioMimeType: 'audio/wav',
    ...(tts.audioError ? { audioError: tts.audioError } : {}),
  };
}

export async function handleCareerAiRequest(
  body: CareerAiRequestBody
): Promise<HandlerResponse> {
  try {
    if (!body || typeof body !== 'object') {
      return {
        status: 400,
        body: { error: 'Сұрау денесі дұрыс емес.' },
      };
    }

    if (body.action === 'analyze') {
      const result = await analyzeStudentAnswers(body.answers, body.abilityProfile);
      return {
        status: 200,
        body: { result },
      };
    }

    if (body.action === 'chat') {
      const reply = await chatWithCounselor(body);
      return {
        status: 200,
        body: { reply },
      };
    }

    if (body.action === 'presentation') {
      const presentation = await generateProfessionPresentation(body);
      return {
        status: 200,
        body: { presentation },
      };
    }

    return {
      status: 400,
      body: { error: 'Белгісіз сұрау түрі (action).' },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message === 'GEMINI_API_KEY_MISSING') {
      return {
        status: 503,
        body: {
          error:
            'Серверде GEMINI_API_KEY орта айнымалысы бапталмаған. Netlify немесе AI Studio ортасында GEMINI_API_KEY мәнін қосыңыз.',
        },
      };
    }

    if (message === 'INVALID_ANSWERS') {
      return {
        status: 400,
        body: { error: 'Талдау жасау үшін барлық тест сұрақтарына жауап беріңіз.' },
      };
    }

    if (message === 'EMPTY_MESSAGE') {
      return {
        status: 400,
        body: { error: 'Сұрағыңызды енгізіңіз.' },
      };
    }

    if (message === 'INVALID_PROGRAM_CODE') {
      return {
        status: 400,
        body: { error: 'Таңдалған мамандық коды каталогтан табылмады.' },
      };
    }

    console.error('[careerAiHandler] Error:', message);

    if (
      message.includes('API_KEY_INVALID') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('403') ||
      message.includes('401')
    ) {
      return {
        status: 403,
        body: {
          error:
            'Gemini API кілті жарамсыз немесе рұқсат жоқ. Settings > Secrets немесе Netlify орта айнымалыларында GEMINI_API_KEY кілтін тексеріңіз.',
        },
      };
    }

    if (message.includes('503') || message.includes('UNAVAILABLE')) {
      return {
        status: 503,
        body: {
          error:
            'AI сервері қазір уақытша жоғары жүктемеде (503). Бірнеше секундтан кейін «Қайталап көру» батырмасын басыңыз.',
        },
      };
    }

    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      return {
        status: 429,
        body: {
          error: 'AI сұрау лимиті уақытша асып кетті. Бір минуттан соң қайталап көріңіз.',
        },
      };
    }

    if (message.includes('NOT_FOUND') || message.includes('404')) {
      return {
        status: 502,
        body: {
          error: 'Таңдалған AI моделі табылмады.',
        },
      };
    }

    return {
      status: 500,
      body: {
        error: 'AI қызметімен байланысу кезінде қате туындады. Бір сәттен соң қайталап көріңіз.',
      },
    };
  }
}
