import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addPersonalGoal,
  buildQuizSummaryPayload,
  computeAbilityProfile,
  computeGoalProgress,
  computeSlideTimeRanges,
  deletePersonalGoal,
  filterEduPrograms,
  filterPersonalGoals,
  findMatchingEduPrograms,
  parseAiResultJson,
  parsePresentationJson,
  toggleComparisonSelection,
  togglePersonalGoal,
  updatePersonalGoalTitle,
  validateQuizAnswers,
} from './careerLogic';
import { ABILITIES, LIKERT_SCALE } from '../data/abilities';
import { EDU_PROGRAMS } from '../data/eduPrograms';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';

test('quiz covers all 12 abilities with 2 questions each and a 5-point Likert scale', () => {
  assert.equal(ABILITIES.length, 12);
  assert.equal(QUIZ_QUESTIONS.length, 24);
  assert.equal(LIKERT_SCALE.length, 5);
  assert.equal(LIKERT_SCALE[0].label, 'Маған мүлде тән емес');
  assert.equal(LIKERT_SCALE[4].label, 'Маған толық тән');

  ABILITIES.forEach((ability) => {
    const count = QUIZ_QUESTIONS.filter((q) => q.abilityId === ability.id).length;
    assert.equal(count, 2, `${ability.title} must have 2 questions`);
  });
});

test('validateQuizAnswers detects incomplete and complete Likert answer sets', () => {
  const partial: Record<string, number> = {
    [QUIZ_QUESTIONS[0].id]: 4,
  };
  const partialResult = validateQuizAnswers(partial, QUIZ_QUESTIONS);
  assert.equal(partialResult.isValid, false);
  assert.equal(partialResult.missingQuestionIndexes.length, QUIZ_QUESTIONS.length - 1);

  const complete: Record<string, number> = {};
  QUIZ_QUESTIONS.forEach((q, i) => {
    complete[q.id] = ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5;
  });
  const completeResult = validateQuizAnswers(complete, QUIZ_QUESTIONS);
  assert.equal(completeResult.isValid, true);
  assert.deepEqual(completeResult.missingQuestionIndexes, []);
});

test('computeAbilityProfile calculates percentages and sorts strictly descending', () => {
  const answers: Record<string, number> = {};
  QUIZ_QUESTIONS.forEach((q) => {
    if (q.abilityId === 'logical') answers[q.id] = 5;
    else if (q.abilityId === 'ai_literacy') answers[q.id] = 4;
    else if (q.abilityId === 'physical') answers[q.id] = 1;
    else answers[q.id] = 3;
  });

  const profile = computeAbilityProfile(answers, QUIZ_QUESTIONS);
  assert.equal(profile.length, 12);
  assert.equal(profile[0].abilityId, 'logical');
  assert.equal(profile[0].percentage, 100);
  assert.equal(profile[1].abilityId, 'ai_literacy');
  assert.equal(profile[1].percentage, 80);
  assert.equal(profile[11].abilityId, 'physical');
  assert.equal(profile[11].percentage, 20);

  for (let i = 1; i < profile.length; i++) {
    assert.ok(profile[i - 1].percentage >= profile[i].percentage);
  }
});

test('buildQuizSummaryPayload maps ability title and Likert rating label accurately', () => {
  const answers: Record<string, number> = {};
  QUIZ_QUESTIONS.forEach((q) => {
    answers[q.id] = 5;
  });

  const payload = buildQuizSummaryPayload(QUIZ_QUESTIONS, answers);
  assert.equal(payload.length, QUIZ_QUESTIONS.length);
  assert.equal(payload[0].abilityTitle, 'Физикалық қабілет');
  assert.equal(payload[0].rating, 5);
  assert.equal(payload[0].ratingLabel, 'Маған толық тән');
});

test('filterEduPrograms filters by domain category and subject pair', () => {
  const itList = filterEduPrograms(
    EDU_PROGRAMS,
    '',
    'Математика + Информатика',
    'IT, математика және жаратылыстану'
  );
  assert.ok(itList.some((p) => p.code === 'B057'));
  assert.ok(itList.every((p) => p.duties.length === 3 && p.skills.length >= 3));
});

test('toggleComparisonSelection enforces max 3 items and allows removal', () => {
  let state = toggleComparisonSelection([], 'a', 3);
  assert.deepEqual(state.nextIds, ['a']);
  assert.equal(state.limitReached, false);

  state = toggleComparisonSelection(['a', 'b', 'c'], 'd', 3);
  assert.deepEqual(state.nextIds, ['a', 'b', 'c']);
  assert.equal(state.limitReached, true);

  state = toggleComparisonSelection(['a', 'b', 'c'], 'b', 3);
  assert.deepEqual(state.nextIds, ['a', 'c']);
  assert.equal(state.limitReached, false);
});

test('parseAiResultJson parses 12-ability profile, combinations, growth areas, 6 recommendations, and next steps', () => {
  const answers: Record<string, number> = {};
  QUIZ_QUESTIONS.forEach((q) => {
    answers[q.id] = q.abilityId === 'logical' || q.abilityId === 'informational' ? 5 : 3;
  });
  const profile = computeAbilityProfile(answers, QUIZ_QUESTIONS);

  const sample = `\`\`\`json
  {
    "summary": "Логикалық және ақпараттық қабілеттерің жоғары деңгейде көрініп тұр.",
    "disclaimer": "Бұл нақты үкім емес, тек мамандықтарды зерттеуге арналған бағдар.",
    "topStrengths": [
      { "abilityTitle": "Логикалық қабілет", "percentage": 100, "explanation": "Есептер мен дәлелдеуге бейімсің." },
      { "abilityTitle": "Ақпараттық қабілет", "percentage": 100, "explanation": "Деректерді тексеріп сұрыптай аласың." },
      { "abilityTitle": "Физикалық қабілет", "percentage": 60, "explanation": "Теңгерімді деңгейде." }
    ],
    "abilityCombinations": [
      {
        "pairTitle": "Логикалық + Ақпараттық",
        "abilities": ["Логикалық қабілет", "Ақпараттық қабілет"],
        "meaning": "Күрделі деректерді талдап, негізді қорытынды шығаруға жақсы жағдай жасайды."
      }
    ],
    "growthAreas": [
      {
        "abilityTitle": "Эстетикалық қабілет",
        "percentage": 60,
        "advice": "Визуал жеткізу дағдысын біртіндеп дамытуға болады.",
        "exercises": ["Аптасына бір инфографика жасап көру"]
      }
    ],
    "recommendations": [
      { "programCode": "B057", "title": "Ақпараттық технологиялар", "relatedField": "IT, математика және жаратылыстану", "whatTheyDo": "Бағдарламалық жүйелер мен деректерді талдайды.", "matchingAbilities": ["Логикалық қабілет", "Ақпараттық қабілет"], "matchReason": "Сандар мен фактілерге сүйенесің.", "schoolSubjects": ["Математика"], "skillsToDevelop": ["SQL", "Статистика"] },
      { "programCode": "B042", "title": "Журналистика және репортер ісі", "relatedField": "Өнер, дизайн және медиа", "whatTheyDo": "Фактілерді тексереді.", "matchingAbilities": ["Ақпараттық қабілет"], "matchReason": "Дереккөздерді салыстыруға бейімсің.", "schoolSubjects": ["Шығармашылық емтихан"], "skillsToDevelop": ["Фактчекинг"] },
      { "programCode": "B046", "title": "Қаржы, экономика, банк және сақтандыру ісі", "relatedField": "Бизнес, басқару және құқық", "whatTheyDo": "Экономикалық көрсеткіштерді бағалайды.", "matchingAbilities": ["Логикалық қабілет"], "matchReason": "Логикалық дәлелдеу жоғары.", "schoolSubjects": ["Математика", "География"], "skillsToDevelop": ["Қаржылық сауаттылық"] },
      { "programCode": "B050", "title": "Биологиялық және сабақтас ғылымдар", "relatedField": "IT, математика және жаратылыстану", "whatTheyDo": "Биологиялық деректерді зерттейді.", "matchingAbilities": ["Логикалық қабілет", "Ақпараттық қабілет"], "matchReason": "Ғылыми деректермен жұмысқа жақын.", "schoolSubjects": ["Биология", "Химия"], "skillsToDevelop": ["Python"] },
      { "programCode": "B063", "title": "Электр техникасы және автоматтандыру", "relatedField": "Инженерия, өндіріс және құрылыс", "whatTheyDo": "Техникалық жүйелерді жобалайды.", "matchingAbilities": ["Логикалық қабілет"], "matchReason": "Құрылымды түсіну қабілеті бар.", "schoolSubjects": ["Математика", "Физика"], "skillsToDevelop": ["Модельдеу"] },
      { "programCode": "B044", "title": "Менеджмент және басқару", "relatedField": "Бизнес, басқару және құқық", "whatTheyDo": "Команда мен өнім бағытын үйлестіреді.", "matchingAbilities": ["Ақпараттық қабілет"], "matchReason": "Ақпаратты жүйелеуге бейім.", "schoolSubjects": ["Математика", "География"], "skillsToDevelop": ["Коммуникация"] }
    ],
    "nextSteps": [
      "Каталогтан 3 түрлі сала мамандығын салыстырып көр.",
      "Мектептегі информатика немесе пікірсайыс үйірмесіне қатысып көр.",
      "AI кеңесшіден осы мамандықтардың күнделікті жұмысы туралы сұра."
    ]
  }
  \`\`\``;

  const parsed = parseAiResultJson(sample, profile);
  assert.equal(parsed.abilityProfile.length, 12);
  assert.equal(parsed.recommendations.length, 6);
  assert.equal(parsed.recommendations[0].programCode, 'B057');
  assert.deepEqual(parsed.recommendations[0].schoolSubjects, ['Математика', 'Информатика']);
  assert.equal(parsed.topStrengths.length, 3);
  assert.equal(parsed.abilityCombinations.length, 1);
  assert.equal(parsed.growthAreas.length, 1);
  assert.equal(parsed.nextSteps.length, 3);
});

test('EDU_PROGRAMS contains all 134 unique program codes with subject filtering', () => {
  assert.equal(EDU_PROGRAMS.length, 134);
  const codes = new Set(EDU_PROGRAMS.map((p) => p.code));
  assert.equal(codes.size, 134);

  const byCyrillicCode = filterEduPrograms(EDU_PROGRAMS, 'В057', 'Барлығы');
  assert.equal(byCyrillicCode.length, 1);
  assert.equal(byCyrillicCode[0].code, 'B057');
  assert.equal(byCyrillicCode[0].subject1, 'Математика');
  assert.equal(byCyrillicCode[0].subject2, 'Информатика');

  const bioChem = filterEduPrograms(EDU_PROGRAMS, '', 'Биология + Химия');
  assert.ok(bioChem.some((p) => p.code === 'BM086' && p.title === 'Медицина'));

  const counselorMatches = findMatchingEduPrograms(EDU_PROGRAMS, 'BM086 медицина қандай пән');
  assert.equal(counselorMatches[0].code, 'BM086');
});

test('personal plan supports short and long term goals CRUD, filtering, and progress', () => {
  let goals = [] as ReturnType<typeof togglePersonalGoal>;

  const emptyAttempt = addPersonalGoal(goals, { title: '   ', horizon: 'short' });
  assert.ok(emptyAttempt.error);
  assert.equal(emptyAttempt.nextGoals.length, 0);

  const addShort = addPersonalGoal(goals, {
    title: 'Информатикадан аптасына 3 есеп шығару',
    horizon: 'short',
    timeframe: 'Осы айда',
  });
  assert.equal(addShort.error, null);
  goals = addShort.nextGoals;

  const addLong = addPersonalGoal(goals, {
    title: 'B057 бағыты бойынша жобалық портфолио жинау',
    horizon: 'long',
    timeframe: 'Оқу жылы соңына дейін',
  });
  assert.equal(addLong.error, null);
  goals = addLong.nextGoals;

  const shortId = goals.find((g) => g.horizon === 'short')!.id;
  goals = togglePersonalGoal(goals, shortId);
  goals = updatePersonalGoalTitle(goals, shortId, 'Информатикадан аптасына 5 есеп шығару');

  const progress = computeGoalProgress(goals);
  assert.equal(progress.total, 2);
  assert.equal(progress.completed, 1);
  assert.equal(progress.percentage, 50);
  assert.equal(progress.shortTotal, 1);
  assert.equal(progress.shortCompleted, 1);
  assert.equal(progress.longTotal, 1);
  assert.equal(progress.longCompleted, 0);

  assert.equal(filterPersonalGoals(goals, 'short', 'completed').length, 1);
  assert.equal(filterPersonalGoals(goals, 'long', 'active').length, 1);

  goals = deletePersonalGoal(goals, shortId);
  assert.equal(goals.length, 1);
});

test('parsePresentationJson and computeSlideTimeRanges build synchronized 4-slide scripts', () => {
  const program = EDU_PROGRAMS.find((p) => p.code === 'B057')!;
  const raw = `\`\`\`json
  {
    "introHook": "IT әлемінде болашақ технологияларды жасауға дайынсың ба?",
    "slides": [
      {
        "theme": "overview",
        "chapterLabel": "01 · Мамандық болмысы",
        "headline": "Бағдарламалық жүйелер сәулетшісі",
        "narration": "Бұл маман веб қосымшалар мен цифрлық сервистерді жобалайды. Күнделікті жұмыста код жазу мен командалық талқылау қатар жүреді.",
        "keyPoints": ["Веб және мобильді қосымшалар", "Деректер базасын баптау", "Командалық өнім жасау"],
        "highlightMetric": "Сұранысы жоғары IT бағыты"
      },
      {
        "theme": "subjects",
        "chapterLabel": "02 · ҰБТ пәндері",
        "headline": "Математика және информатика негізі",
        "narration": "ҰБТ-да Математика мен Информатика пәндерін таңдау осы бағытқа жол ашады. Логикалық есептер алгоритм құруға тікелей көмектеседі.",
        "keyPoints": ["Математика: логика негізі", "Информатика: алгоритмдер", "Практикалық жобалар"],
        "highlightMetric": "Математика + Информатика"
      },
      {
        "theme": "skills",
        "chapterLabel": "03 · Негізгі дағдылар",
        "headline": "Заманауи код және аналитика",
        "narration": "Бағдарламалау тілдерін меңгеру мен мәселені бөлшектеп шешу маңызды. Сонымен қатар ағылшын тілі кәсіби өсуге мүмкіндік береді.",
        "keyPoints": ["Python және TypeScript", "Жүйелі ойлау", "Техникалық ағылшын тілі"],
        "highlightMetric": "3 негізгі кәсіби дағды"
      },
      {
        "theme": "future",
        "chapterLabel": "04 · Болашақ және мансап",
        "headline": "Қазақстан мен әлемдегі мүмкіндіктер",
        "narration": "Қаржы, білім, мемлекеттік цифрландыру және стартап салаларында жұмыс істей аласың. Тәжірибе жинаған сайын халықаралық жобаларға шығуға болады.",
        "keyPoints": ["IT компаниялар мен банктер", "Қашықтан жұмыс мүмкіндігі", "Өз стартап жобаң"],
        "highlightMetric": "Тұрақты кәсіби өсім"
      }
    ]
  }
  \`\`\``;

  const parsed = parsePresentationJson(raw, program);
  assert.equal(parsed.programCode, 'B057');
  assert.equal(parsed.subjectPairLabel, 'Математика + Информатика');
  assert.equal(parsed.slides.length, 4);
  assert.ok(parsed.fullNarrationScript.includes('Бағдарламалау тілдерін'));

  const ranges = computeSlideTimeRanges(parsed.slides);
  assert.equal(ranges.length, 4);
  assert.equal(ranges[0].startRatio, 0);
  assert.equal(ranges[3].endRatio, 1);
  for (let i = 1; i < ranges.length; i++) {
    assert.ok(Math.abs(ranges[i].startRatio - ranges[i - 1].endRatio) < 1e-9);
  }
});



